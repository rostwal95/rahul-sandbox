//*
// This proto file contains messages with attributes
// related to timestamp and sentiment analysis

// @generated by protoc-gen-es v1.10.0 with parameter "target=ts"
// @generated from file messages.proto (package com.cisco.wcc.ccai.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message as Message$1, proto3, protoInt64 } from "@bufbuild/protobuf";

/**
 *
 * Represents the Timestamp object which denotes seconds and nanos
 *
 * @generated from message com.cisco.wcc.ccai.v1.Timestamp
 */
export class Timestamp extends Message$1<Timestamp> {
  /**
   * seconds
   *
   * @generated from field: int64 seconds = 1;
   */
  seconds = protoInt64.zero;

  /**
   * nanos
   *
   * @generated from field: int32 nanos = 2;
   */
  nanos = 0;

  constructor(data?: PartialMessage<Timestamp>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.cisco.wcc.ccai.v1.Timestamp";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "seconds", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
    { no: 2, name: "nanos", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Timestamp {
    return new Timestamp().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Timestamp {
    return new Timestamp().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Timestamp {
    return new Timestamp().fromJsonString(jsonString, options);
  }

  static equals(a: Timestamp | PlainMessage<Timestamp> | undefined, b: Timestamp | PlainMessage<Timestamp> | undefined): boolean {
    return proto3.util.equals(Timestamp, a, b);
  }
}

/**
 *
 * Represents the SentimentAnalysis object with score and magnitude
 *
 * @generated from message com.cisco.wcc.ccai.v1.SentimentAnalysis
 */
export class SentimentAnalysis extends Message$1<SentimentAnalysis> {
  /**
   * score
   *
   * @generated from field: float score = 1;
   */
  score = 0;

  /**
   * magnitude
   *
   * @generated from field: float magnitude = 2;
   */
  magnitude = 0;

  constructor(data?: PartialMessage<SentimentAnalysis>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.cisco.wcc.ccai.v1.SentimentAnalysis";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "score", kind: "scalar", T: 2 /* ScalarType.FLOAT */ },
    { no: 2, name: "magnitude", kind: "scalar", T: 2 /* ScalarType.FLOAT */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SentimentAnalysis {
    return new SentimentAnalysis().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SentimentAnalysis {
    return new SentimentAnalysis().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SentimentAnalysis {
    return new SentimentAnalysis().fromJsonString(jsonString, options);
  }

  static equals(a: SentimentAnalysis | PlainMessage<SentimentAnalysis> | undefined, b: SentimentAnalysis | PlainMessage<SentimentAnalysis> | undefined): boolean {
    return proto3.util.equals(SentimentAnalysis, a, b);
  }
}

/**
 *
 * Represents the Message object with various attributes including timestamp and sentiment analysis
 *
 * @generated from message com.cisco.wcc.ccai.v1.Message
 */
export class Message extends Message$1<Message> {
  /**
   * Name
   *
   * @generated from field: string name = 1;
   */
  name = "";

  /**
   * Content
   *
   * @generated from field: string content = 2;
   */
  content = "";

  /**
   * Language Code
   *
   * @generated from field: string languageCode = 3;
   */
  languageCode = "";

  /**
   * Participant
   *
   * @generated from field: string participant = 4;
   */
  participant = "";

  /**
   * Participant Role
   *
   * @generated from field: string participantRole = 5;
   */
  participantRole = "";

  /**
   * Creation timestamp
   *
   * @generated from field: com.cisco.wcc.ccai.v1.Timestamp create_time = 6;
   */
  createTime?: Timestamp;

  /**
   * Sentiment Analysis
   *
   * @generated from field: com.cisco.wcc.ccai.v1.SentimentAnalysis sentiment_analysis = 8;
   */
  sentimentAnalysis?: SentimentAnalysis;

  constructor(data?: PartialMessage<Message>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.cisco.wcc.ccai.v1.Message";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "content", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "languageCode", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "participant", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 5, name: "participantRole", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 6, name: "create_time", kind: "message", T: Timestamp },
    { no: 8, name: "sentiment_analysis", kind: "message", T: SentimentAnalysis },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Message {
    return new Message().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Message {
    return new Message().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Message {
    return new Message().fromJsonString(jsonString, options);
  }

  static equals(a: Message | PlainMessage<Message> | undefined, b: Message | PlainMessage<Message> | undefined): boolean {
    return proto3.util.equals(Message, a, b);
  }
}

