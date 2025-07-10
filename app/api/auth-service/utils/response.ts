/**
 * Standard response utilities for the auth microservice
 *
 * These functions ensure consistent response format across all auth service endpoints.
 */
import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "../config";
import { cookies } from "next/headers";

/**
 * Create a standard error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code: string = "ERROR",
  details?: any,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
      service: AUTH_CONFIG.SERVICE_NAME,
      version: AUTH_CONFIG.SERVICE_VERSION,
    },
    { status },
  );
}

/**
 * Create a standard success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      service: AUTH_CONFIG.SERVICE_NAME,
      version: AUTH_CONFIG.SERVICE_VERSION,
    },
    { status },
  );
}

/**
 * Create a success response with an auth token cookie
 */
export function responseWithAuthCookie(
  data: any,
  token: string,
  status: number = 200,
) {
  const response = NextResponse.json(
    {
      success: true,
      data,
      service: AUTH_CONFIG.SERVICE_NAME,
      version: AUTH_CONFIG.SERVICE_VERSION,
    },
    { status },
  );

  // Set the auth cookie
  // In staging/autoscale environment, we need secure cookies for HTTPS
  const isSecureEnvironment = process.env.NODE_ENV === "production" || 
                            process.env.REPLIT_DOMAINS?.includes(".replit.dev");
  
  response.cookies.set({
    name: AUTH_CONFIG.COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isSecureEnvironment,
    maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

/**
 * Create a response that clears the auth cookie
 */
export function responseWithClearAuthCookie(data: any, status: number = 200) {
  const response = NextResponse.json(
    {
      success: true,
      data,
      service: AUTH_CONFIG.SERVICE_NAME,
      version: AUTH_CONFIG.SERVICE_VERSION,
    },
    { status },
  );

  // Clear the auth cookie
  // In staging/autoscale environment, we need secure cookies for HTTPS
  const isSecureEnvironment = process.env.NODE_ENV === "production" || 
                            process.env.REPLIT_DOMAINS?.includes(".replit.dev");
  
  response.cookies.set({
    name: AUTH_CONFIG.COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isSecureEnvironment,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
