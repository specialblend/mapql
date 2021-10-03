import gql from "graphql-tag";
import map, { Json } from "../src";

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
                  from: "$"
                  filter: { selector: { sourceType: "input" } }
                )
                  @prop(_: "name")
                  @concat(before: "{{workflow.inputs.parameters.", after: "}}")
                configMapKeyRef(
                  from: "$"
                  filter: { selector: { sourceType: "configmap" } }
                ) {
                  name: sourceName
                  key: sourceKey
                }
                secretKeyRef(
                  from: "$"
                  filter: { selector: { sourceType: "secret" } }
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
  const result = map(query, data as Json);
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
