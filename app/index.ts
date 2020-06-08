/// <reference types="@google/local-home-sdk" />

const app = new smarthome.App("1.0.0")
  .onIdentify((request) => {
    console.debug("IDENTIFY request:", request);

    const device = request.inputs[0].payload.device;

    return new Promise((resolve, reject) => {
      const response = {
        intent: smarthome.Intents.IDENTIFY,
        requestId: request.requestId,
        payload: {
          device: {
            id: device.id || "",
            // TODO: add verificationId.
          },
        },
      };
      console.debug("IDENTIFY response", response);
      resolve(response);
    });
  })
  .onExecute((request) => {
    console.debug("EXECUTE request", request);

    const response =  new smarthome.Execute.Response.Builder()
      .setRequestId(request.requestId);
    const command = request.inputs[0].payload.commands[0];

    return Promise.all(command.devices.map((device) => {
      // TODO: send device command.
      // TODO: set response success/errorState.
    })).then(() => {
      console.debug("EXECUTE response", response);
      return response.build();
    });
  })
  .listen()
  .then(() => {
    console.log("Ready");
  });
