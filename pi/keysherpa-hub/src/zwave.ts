const { Driver } = require("zwave-js");

const UserIDStatus = { Available: 0, Enabled: 1 } as const;

export class ZWaveClient {
  private driver: any;
  private ready = false;

  constructor(private serialPort: string) {
    this.driver = new Driver(serialPort, {
      logConfig: { enabled: true, level: "debug", logToFile: true, filename: "/var/log/keysherpa-zwave.log" },
      storage: { cacheDir: "/var/lib/keysherpa-hub/cache" },
      securityKeys: {
        S0_Legacy: Buffer.from('0102030405060708090a0b0c0d0e0f10', 'hex'),
        S2_Unauthenticated: Buffer.from('1112131415161718191a1b1c1d1e1f20', 'hex'),
        S2_Authenticated: Buffer.from('2122232425262728292a2b2c2d2e2f30', 'hex'),
      },
    });
    this.driver.on("error", (err: unknown) => {
      console.error("[ZWave] Driver error:", err);
    });
  }

  async start(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.driver.once("driver ready", () => {
        this.ready = true;
        resolve();
      });
      this.driver.start();
    });
  }

  async execute(commandType: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.ready) throw new Error("Z-Wave driver not ready");
    switch (commandType) {
      case "create_code": return this.createCode(payload);
      case "delete_code": return this.deleteCode(payload);
      case "get_status": return this.getStatus(payload);
      case "lock": return this.setLock(payload, true);
      case "unlock": return this.setLock(payload, false);
      case "pair_lock": return this.pairLock();
      case "unpair_lock": return this.unpairLock(payload);
      case "list_nodes": return this.listNodes();
      case "remove_node": return this.removeNode(payload);
      default: throw new Error("Unknown command: " + commandType);
    }
  }

  private getNode(nodeId: number) {
    const node = this.driver.controller.nodes.get(nodeId);
    if (!node) throw new Error("Z-Wave node " + nodeId + " not found");
    return node;
  }

  private async findFreeSlot(nodeId: number): Promise<number> {
    const node = this.getNode(nodeId);
    const cc = node.commandClasses["User Code"];
    const count = await cc.getUsersCount();
    for (let i = 1; i <= count; i++) {
      const u = await cc.get(i);
      if (!u || u.userIdStatus === UserIDStatus.Available) return i;
    }
    throw new Error("No free user code slots");
  }

  private async createCode(p: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nodeId = p.nodeId as number;
    const code = p.code as string;
    const slot = await this.findFreeSlot(nodeId);
    const node = this.getNode(nodeId);
    await node.commandClasses["User Code"].set(slot, 1, code);
    return { slot, nodeId };
  }

  private async deleteCode(p: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nodeId = p.nodeId as number;
    const slot = p.slot as number;
    const node = this.getNode(nodeId);
    await node.commandClasses["User Code"].clear(slot);
    return { deleted: true, slot };
  }

  private async getStatus(p: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nodeId = p.nodeId as number;
    const node = this.getNode(nodeId);
    let locked: boolean | null = null;
    let battery: number | null = null;
    try {
      const r = await node.commandClasses["Door Lock"].get();
      locked = r !== undefined ? r.currentMode !== 0 : null;
    } catch {}
    try {
      const b = await node.commandClasses["Battery"].get();
      battery = b !== undefined ? b.level / 100 : null;
    } catch {}
    return { locked, battery, online: node.isAlive ?? true, nodeId };
  }

  private async setLock(p: Record<string, unknown>, lock: boolean): Promise<Record<string, unknown>> {
    const nodeId = p.nodeId as number;
    const node = this.getNode(nodeId);
    await node.commandClasses["Door Lock"].set(lock ? 0x01 : 0x00);
    return { success: true };
  }

  private async pairLock(): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.driver.controller.stopInclusion();
        reject(new Error("Pairing timed out — lock was not detected within 90 seconds"));
      }, 90_000);

      this.driver.controller.on("node added", (node: any) => {
        clearTimeout(timeout);
        console.log("[ZWave] Lock paired! Node ID:", node.id);
        resolve({ nodeId: node.id });
      });

      // strategy: 0 = Default (tries S2, falls back to S0, then insecure)
      // Locks REQUIRE secure inclusion — they ignore strategy 2 (Insecure)
      this.driver.controller.beginInclusion({ strategy: 0 }).catch((err: any) => {
        clearTimeout(timeout);
        reject(err);
      });

      console.log("[ZWave] Inclusion mode active (Default strategy, S2/S0) — waiting for lock...");
    });
  }

  private async unpairLock(p: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nodeId = p.nodeId as number | undefined;

    // If a nodeId is provided, try a hard remove (forces removal even if the lock isn't present)
    if (nodeId) {
      try {
        await this.driver.controller.removeFailedNode(nodeId);
        console.log("[ZWave] Force-removed node:", nodeId);
        return { unpaired: true, nodeId, method: "force" };
      } catch (err) {
        console.log("[ZWave] Force-remove failed, falling back to exclusion:", err);
      }
    }

    // Otherwise (or as a fallback), use standard exclusion — user must put lock in pair/exclude mode
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.driver.controller.stopExclusion();
        reject(new Error("Unpairing timed out — lock was not detected within 90 seconds"));
      }, 90_000);

      this.driver.controller.on("node removed", (node: any) => {
        clearTimeout(timeout);
        console.log("[ZWave] Lock unpaired! Node ID:", node.id);
        resolve({ unpaired: true, nodeId: node.id, method: "exclusion" });
      });

      this.driver.controller.beginExclusion().catch((err: any) => {
        clearTimeout(timeout);
        reject(err);
      });

      console.log("[ZWave] Exclusion mode active — waiting for lock...");
    });
  }

  private async listNodes(): Promise<Record<string, unknown>> {
    const nodes: Array<Record<string, unknown>> = [];
    this.driver.controller.nodes.forEach((n: any) => {
      // Skip the controller itself (ownNodeId)
      if (n.id === this.driver.controller.ownNodeId) return;
      nodes.push({
        nodeId: n.id,
        label: n.deviceConfig?.label ?? null,
        manufacturer: n.deviceConfig?.manufacturer ?? null,
        isAlive: n.isAlive ?? null,
        status: n.status,
      });
    });
    return { nodes };
  }

  private async removeNode(p: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nodeId = p.nodeId as number;
    if (!nodeId) throw new Error("Missing nodeId");

    // Try force-remove first (works on unresponsive/failed nodes)
    try {
      await this.driver.controller.removeFailedNode(nodeId);
      console.log("[ZWave] Force-removed node:", nodeId);
      return { removed: true, nodeId, method: "force" };
    } catch (err) {
      console.log("[ZWave] Force-remove failed:", err);
    }

    // Fall back to exclusion (requires lock in exclude mode)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.driver.controller.stopExclusion();
        reject(new Error("Exclusion timed out — put lock in exclude mode (Kwikset: hold A button 5 sec) or use Force Clear"));
      }, 60_000);

      this.driver.controller.on("node removed", (node: any) => {
        clearTimeout(timeout);
        resolve({ removed: true, nodeId: node.id, method: "exclusion" });
      });

      this.driver.controller.beginExclusion().catch((e: any) => {
        clearTimeout(timeout);
        reject(e);
      });
    });
  }

  async stop(): Promise<void> {
    await this.driver.destroy();
  }
}
