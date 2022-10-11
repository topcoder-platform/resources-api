const { RESOURCE_GRPC_SERVER_HOST, RESOURCE_GRPC_SERVER_PORT } = process.env;

import { promisify } from "util";

import { credentials, Metadata } from "@grpc/grpc-js";
import {
  LookupCriteria,
  ScanRequest,
  ScanResult,
} from "../../models/resource/common/Common";

import { ResourceRolePhaseDependencyClient } from "../../models/resource/service/ResourceRolePhaseDependency";
import {
  CreateResourceRolePhaseDependencyInput,
  ResourceRolePhaseDependency,
  ResourceRolePhaseDependencyList,
} from "../../models/resource/resource/ResourceRolePhaseDependency";

class ResourceRolePhaseDependencyDomain {
  private readonly client: ResourceRolePhaseDependencyClient =
    new ResourceRolePhaseDependencyClient(
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
    param: CreateResourceRolePhaseDependencyInput,
    metadata: Metadata = new Metadata()
  ): Promise<ResourceRolePhaseDependency> {
    return promisify<
      CreateResourceRolePhaseDependencyInput,
      Metadata,
      ResourceRolePhaseDependency
    >(this.client.create.bind(this.client))(param, metadata);
  }

  public async delete(
    param: LookupCriteria,
    metadata: Metadata = new Metadata()
  ): Promise<ResourceRolePhaseDependencyList> {
    return promisify<LookupCriteria, Metadata, ResourceRolePhaseDependencyList>(
      this.client.delete.bind(this.client)
    )(param, metadata);
  }
}

export const resourceRolePhaseDependency =
  new ResourceRolePhaseDependencyDomain();
