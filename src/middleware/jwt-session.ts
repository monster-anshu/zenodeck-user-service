import { normalizeHttpResponse } from "@middy/util";
import { getChanges } from "@/utils";
import middy from "@middy/core";
import { BASE_DOMAIN, STAGE } from "@/env";
import { SessionCookie } from "@/utils/cookie";
import signJwt from "@/lib/jwt/sign";
import verifyJwt from "@/lib/jwt/verify";
import dayjs from "@/dayjs";

const jwtSessionCookie = new SessionCookie({
  name: "__session",
  secret: process.env.SESSION_COOKIE_SECRET,
});

const getDateAfterMinutes = (minutes: number) => {
  const now = dayjs();
  return now.add(minutes, "minute").toDate();
};

export const jwtSessionMiddleware = () => {
  const sessionMiddlewareBefore = async (request: middy.Request) => {
    const headers = request.event.headers;
    const jwtValue = jwtSessionCookie.getcookie(
      headers.Cookie || headers.cookie
    );
    let session;

    if (jwtValue) {
      session = await verifyJwt(jwtValue);
    }

    request.event.oldSession = session || {};
    request.event.session = JSON.parse(
      JSON.stringify(request.event.oldSession)
    );
  };

  const sessionMiddlewareAfter = async (request: middy.Request) => {
    normalizeHttpResponse(request);
    const cookieDomains = [BASE_DOMAIN.replace(/^https?:\/\/(www\.)?/, "")];

    if (["dev"].includes(STAGE)) {
      cookieDomains.push("localhost");
    }

    const { session, oldSession } = request.event;

    if (!session || !Object.keys(session).length) {
      if (!request.response.multiValueHeaders) {
        request.response.multiValueHeaders = {};
      }
      cookieDomains.forEach((cookieDomain) => {
        const header = jwtSessionCookie.setcookie(request.response, "", {
          expires: getDateAfterMinutes(0),
          domain: cookieDomain,
        });
        request.response.multiValueHeaders["Set-Cookie"] = header;
      });
    } else {
      const changes = getChanges(oldSession, session);
      const hasChanges = changes && Object.keys(changes).length;

      if (hasChanges) {
        const jwtValue = signJwt(session, {
          expiresIn: 90 * 24 * 60 * 60,
        });
        if (!request.response.multiValueHeaders) {
          request.response.multiValueHeaders = {};
        }
        cookieDomains.forEach((cookieDomain) => {
          const header = jwtSessionCookie.setcookie(
            request.response,
            jwtValue,
            {
              expires: getDateAfterMinutes(90 * 24 * 60),
              domain: cookieDomain,
            }
          );
          request.response.multiValueHeaders["Set-Cookie"] = header;
        });
      }
    }
  };

  const sessionMiddlewareOnError = async (request: middy.Request) => {
    if (request.response === undefined) return;
    sessionMiddlewareAfter(request);
  };

  return {
    before: sessionMiddlewareBefore,
    after: sessionMiddlewareAfter,
    onError: sessionMiddlewareOnError,
  };
};
