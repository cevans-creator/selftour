import { Driver, UserIDStatus } from "zwave-js";

export class ZWaveClient {
  private driver: Driver;
  private ready = false;

  constructor(private serialPort: string) {
    this.driver = new Driver(serialPort, {
      logConfig: { enabled: false },
      storage: { cacheDir: "/var/lib/keysherpa-hub/cache" },
      interview: { queryAllUserCodes: false },
    });

    this.driver.on("error", (err) => {
      console.error("[ZWave] Driver error:", err);
    });
  }

  async start(): Promise<void> {
    await this.driver.start();
    await new Promise<void>((resolve) => {
      this.driver.controller.on("inclusion started", () => {});
      this.driver.once("driver ready", () => {
        this.ready = true;
        resolve();
      });
    });
  }

  async execute(
    commandType: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.ready) throw new Error("Z-Wave driver not ready");

    switch (commandType) {
      case "create_code":
        return this.createCode(payload);
      case "delete_code":
        return this.deleteCode(payload);
      case "get_status":
        return this.getStatus(payload);
      case "lock":
        return this.setLock(payload, true);
      case "unlock":
        return this.setLock(payload, false);
      default:
        throw new Error(`Unknown command type: ${commandType}`);
    }
  }

  private getNode(nodeId: number) {
    const node = this.driver.controller.nodes.get(nodeId);
    if (!node) throw new Error(`Z-Wave node ${nodeId} not found`);
    return node;
  }

  private async findFreeSlot(nodeId: number): Promise<number> {
    const node = this.getNode(nodeId);
    const userCodeCC = node.commandClasses["User Code"];
    const usersCount = await userCodeCC.getUsersCount();
    for (let slot = 1; slot <= usersCount; slot++) {
      const user = await userCodeCC.get(slot);
      if (user?.userIdStatus === UserIDStatus.Available || !user) {
        return slot;
      }
    }
    throw new Error("No free user code slots available");
  }

  private async createCode(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nodeId = payload.nodeId as number;
    const code = payload.code as string;
    const node = this.getNode(nodeId);
    const userCodeCC = node.commandClasses["User Code"];
    const slot = await this.findFreeSlot(nodeId);
    await userCodeCC.set(slot, UserIDStatus.Enabled, code);
    return { slot, nodeId };
  }

  private async deleteCode(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nodeId = payload.nodeId as number;
    const slot = payload.slot as number;
    const node = this.getNode(nodeId);
    const userCodeCC = node.commandClasses["User Code"];
    await userCodeCC.set(slot, UserIDStatus.Available, "");
    return { deleted: true, slot };
  }

  private async getStatus(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nodeId = payload.nodeId as number;
    const node = this.getNode(nodeId);

    let locked: boolean | null = null;
    let battery: number | null = null;

    try {
      const lockCC = node.commandClasses["Door Lock"];
      const report = await lockCC.get();
      locked = report !== undefined ? report.currentMode !== 0 : null;
    } catch {
      // Node may not support Door Lock CC directly
    }

    try {
      const batteryCC = node.commandClasses["Battery"];
      const batteryReport = await batteryCC.get();
      battery = batteryReport !== undefined ? batteryReport.level / 100 : null;
    } catch {
      // Battery CC may not be supported
    }

    return {
      locked,
      battery,
      online: node.isAlive ?? true,
      nodeId,
    };
  }

  private async setLock(
    payload: Record<string, unknown>,
    lock: boolean
  ): Promise<Record<string, unknown>> {
    const nodeId = payload.nodeId as number;
    const node = this.getNode(nodeId);
    const lockCC = node.commandClasses["Door Lock"];
    if (lock) {
      await lockCC.set(0x01); // Secured
    } else {
      await lockCC.set(0x00); // Unsecured
    }
    return { success: true };
  }

  async stop(): Promise<void> {
    await this.driver.destroy();
  }
}
