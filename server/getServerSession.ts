import { authOptions } from "./api/auth/[...]";
import { getServerSession } from "#auth";

import type { H3Event, EventHandlerRequest } from "h3";

export default (e: H3Event<EventHandlerRequest>) =>
  getServerSession(e, authOptions);
