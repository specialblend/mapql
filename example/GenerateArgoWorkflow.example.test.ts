import gql from "graphql-tag";
import map, { JsonRecord } from "../src";

test("GenerateArgoWorkflow", () => {
  const data = {
    name: "example-workflow",
    image: "docker/whalesay",
    entrypoint: "whalesay",
    command: ["cowsay"],
    args: ["hello world"],
    parameters: [
      {
        name: "API_TOKEN",
        sourceType: "secret",
        sourceName: "example-secret",
        sourceKey: "api-token",
      },
      {
        name: "API_URL",
        sourceType: "configmap",
        sourceName: "example-configmap",
        sourceKey: "api-url",
      },
      {
        name: "SUBJECT",
        sourceType: "input",
      },
    ],
    templates: [{}],
  };
  const query = gql`
    query GenerateArgoWorkflow {
      apiVersion @default(to: "argoproj.io/v1alpha1")
      kind @const(of: "WorkflowTemplate")
      metadata {
        name
      }
      spec {
        entrypoint @default(to: "main")
        templates {
          name: entrypoint @default(to: "main")
          container {
            image
            command
            args
            env(from: "parameters") {
              name
              valueFrom {
                parameter(
                  from: "name"
                  filter: { from: "@", match: { sourceType: "input" } }
                ) @concat(before: "{{workflow.inputs.parameters.", after: "}}")
                configMapKeyRef(filter: { match: { sourceType: "configmap" } })
                  @nomap {
                  name: sourceName
                  key: sourceKey
                }
                secretKeyRef(
                  from: "@"
                  filter: { match: { sourceType: "secret" } }
                ) {
                  name: sourceName
                  key: sourceKey
                }
              }
            }
            resources {
              limits {
                memory @default(to: "32Mi")
                cpu @default(to: "100m")
              }
            }
          }
        }
      }
    }
  `;
  const result = map(query, data as JsonRecord);
  expect(result).toEqual(
    //
    {
      apiVersion: "argoproj.io/v1alpha1",
      kind: "WorkflowTemplate",
      metadata: {
        name: "example-workflow",
      },
      spec: {
        entrypoint: "whalesay",
        templates: {
          container: {
            args: ["hello world"],
            command: ["cowsay"],
            env: [
              {
                name: "API_TOKEN",
                valueFrom: {
                  secretKeyRef: {
                    key: "api-token",
                    name: "example-secret",
                  },
                },
              },
              {
                name: "API_URL",
                valueFrom: {
                  configMapKeyRef: {
                    key: "api-url",
                    name: "example-configmap",
                  },
                },
              },
              {
                name: "SUBJECT",
                valueFrom: {
                  parameter: "{{workflow.inputs.parameters.SUBJECT}}",
                },
              },
            ],
            image: "docker/whalesay",
            resources: {
              limits: {
                cpu: "100m",
                memory: "32Mi",
              },
            },
          },
          name: "whalesay",
        },
      },
    }
  );
});
