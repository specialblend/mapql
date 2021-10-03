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
        templates @map {
          name: entrypoint @default(to: "main")
          container {
            image
            command
            args
            env: parameters(filter: { sourceType: "secret" }) {
              name
              valueFrom {
                secretKeyRef {
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
        templates: [
          {
            container: {
              resources: {
                limits: {
                  cpu: "100m",
                  memory: "32Mi",
                },
              },
            },
            name: "main",
          },
        ],
      },
    }
  );
});
