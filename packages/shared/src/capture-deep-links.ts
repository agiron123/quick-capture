export const CAPTURE_APP_SCHEME = 'quickcapture';

export const captureRoutes = {
  voice: '/voice-record',
  camera: '/capture',
  addTodo: '/add-todo',
} as const;

export type CaptureRoute = (typeof captureRoutes)[keyof typeof captureRoutes];

export function buildCaptureDeepLink(route: CaptureRoute): string {
  return `${CAPTURE_APP_SCHEME}://${route.replace(/^\//, '')}`;
}

export const captureDeepLinks = {
  voice: buildCaptureDeepLink(captureRoutes.voice),
  camera: buildCaptureDeepLink(captureRoutes.camera),
  addTodo: buildCaptureDeepLink(captureRoutes.addTodo),
} as const;
