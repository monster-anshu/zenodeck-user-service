import middy from "@middy/core";
import * as cookie from "cookie";

export class SessionCookie {
  name: string;
  secret?: string;
  isSigned: boolean;
  constructor({
    name,
    secret,
    isSigned = true,
  }: {
    name: string;
    secret?: string;
    isSigned?: boolean;
  }) {
    this.name = name;
    this.secret = secret;
    this.isSigned = isSigned;
  }

  getcookie(header: string) {
    // read from cookie header
    if (header) {
      const cookies = cookie.parse(header);
      return cookies[this.name];
    }
    return null;
  }

  setcookie(
    res: middy.Request["response"],
    value: string,
    options: cookie.CookieSerializeOptions,
  ) {
    const defaultOptions = {
      httpOnly: true,
      secure: true,
      path: "/",
      SameSite: "None",
    };

    const data = cookie.serialize(this.name, value, {
      ...defaultOptions,
      ...options,
    });

    const prev = res.multiValueHeaders?.["Set-Cookie"] || [];
    const header = Array.isArray(prev) ? prev.concat(data) : [prev, data];
    return header;
  }
}
