import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { db } from "../../../../lib/db-connection";
import { systemSystemEvents } from "@shared/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      recipientId,
      recipientEmail,
      subject,
      body: messageBody,
      priority = "normal",
      deliveryMethod = "email",
      scheduleDelivery = false,
      scheduleDate,
      scheduleTime,
      requiresResponse = false,
      sentBy,
    } = body;

    // Validate required fields
    if (!recipientId || !subject || !messageBody || !sentBy) {
      return NextResponse.json(
        {
          error: "Missing required fields: recipientId, subject, body, sentBy",
        },
        { status: 400 },
      );
    }

    // In a real implementation, this would integrate with email service
    // For now, we'll simulate the message sending and log to system events

    const messageId = crypto.randomUUID();
    const timestamp = new Date();

    // Log message sent event to system events
    await db.insert(systemEvents).values({
      source: "team_management",
      eventType: "message.sent",
      eventName: "Team Message Sent",
      payload: {
        messageId,
        recipientId,
        recipientEmail,
        subject,
        priority,
        deliveryMethod,
        scheduleDelivery,
        requiresResponse,
        sentBy,
        timestamp: timestamp.toISOString(),
      },
      status: "completed",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Simulate email/SMS sending based on delivery method
    if (deliveryMethod === "email") {
      console.log(`📧 Email sent to ${recipientEmail}: ${subject}`);
    } else if (deliveryMethod === "sms") {
      console.log(`📱 SMS sent to recipient ${recipientId}: ${subject}`);
    } else if (deliveryMethod === "app") {
      console.log(`🔔 In-app notification sent to ${recipientId}: ${subject}`);
    }

    return NextResponse.json({
      success: true,
      messageId,
      status: scheduleDelivery ? "scheduled" : "sent",
      deliveryMethod,
      timestamp: timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
