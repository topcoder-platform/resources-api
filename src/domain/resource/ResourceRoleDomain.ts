const { RESOURCE_GRPC_SERVER_HOST, RESOURCE_GRPC_SERVER_PORT } = process.env;

import { promisify } from "util";

import { credentials, Metadata } from "@grpc/grpc-js";
import { ScanRequest, ScanResult } from "../../models/resource/common/Common";
import { ResourceRoleClient } from "../../models/resource/service/ResourceRole";
import {
  CreateResourceRoleInput,
  ResourceRole,
} from "../../models/resource/resource/ResourceRole";

class ResourceRoleDomain {
  private readonly client: ResourceRoleClient = new ResourceRoleClient(
    `${RESOURCE_GRPC_SERVER_HOST}:${RESOURCE_GRPC_SERVER_PORT}`,
    credentials.createInsecure(),
    {
      "grpc.keepalive_time_ms": 120000,
      "grpc.http2.min_time_between_pings_ms": 120000,
      "grpc.keepalive_timeout_ms": 20000,
      "grpc.http2.max_pings_without_data": 0,
      "grpc.keepalive_permit_without_calls": 1,
    }
  );

  public async scan(
    param: ScanRequest,
    metadata: Metadata = new Metadata()
  ): Promise<ScanResult> {
    return promisify<ScanRequest, Metadata, ScanResult>(
      this.client.scan.bind(this.client)
    )(param, metadata);
  }

  public async create(
    param: CreateResourceRoleInput,
    metadata: Metadata = new Metadata()
  ): Promise<ResourceRole> {
    return promisify<CreateResourceRoleInput, Metadata, ResourceRole>(
      this.client.create.bind(this.client)
    )(param, metadata);
  }
}

export const resourceRoleDomain = new ResourceRoleDomain();
