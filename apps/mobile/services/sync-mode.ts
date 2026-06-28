let serverRemindersEnabled = false;

export function isServerRemindersEnabled(): boolean {
  return serverRemindersEnabled;
}

export function setServerRemindersEnabled(enabled: boolean): void {
  serverRemindersEnabled = enabled;
}
