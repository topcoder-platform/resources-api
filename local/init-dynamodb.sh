# Create the Resource table
aws dynamodb create-table \
  --table-name Resource \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=challengeId,AttributeType=S AttributeName=memberId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes '[{"IndexName":"resource-challengeIdMemberId-index","KeySchema":[{"AttributeName":"challengeId","KeyType":"HASH"}, {"AttributeName":"memberId","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}, "ProvisionedThroughput": {"ReadCapacityUnits": 2, "WriteCapacityUnits": 2}}]' \
  --region us-east-1 \
  --provisioned-throughput ReadCapacityUnits=4,WriteCapacityUnits=2 \
  --endpoint-url http://localhost:7777

# Create the ResourceRole table
aws dynamodb create-table \
  --table-name ResourceRole \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=nameLower,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes '[{"IndexName":"resourceRole-nameLower-index","KeySchema":[{"AttributeName":"nameLower","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}, "ProvisionedThroughput": {"ReadCapacityUnits": 2, "WriteCapacityUnits": 2}}]' \
  --region us-east-1 \
  --provisioned-throughput ReadCapacityUnits=4,WriteCapacityUnits=2 \
  --endpoint-url http://localhost:7777
