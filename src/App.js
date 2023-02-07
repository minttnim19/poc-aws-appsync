import "./App.css";
import React, { useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import Amplify from "@aws-amplify/core";
import * as subscriptions from "./graphql/subscriptions"; //codegen generated code
import * as mutations from "./graphql/mutations"; //codegen generated code
import awsmobile from "./aws-exports";

Amplify.configure(awsmobile);

function App() {
  const [send, setSend] = useState("");
  const [received, setReceived] = useState("");
  const [channel, setChannel] = useState("");

  //Define the channel name here
  let data = "";

  //Publish data to subscribed clients
  async function publish(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    await API.graphql(
      graphqlOperation(mutations.publish, { name: channel, data: send })
    );
    setSend("Enter valid JSON here... (use quotes for keys and values)");
  }

  async function subscript(channel) {
    setChannel(channel);
    const subscription = API.graphql(
      graphqlOperation(subscriptions.subscribe, { name: channel })
    ).subscribe({
      next: ({ provider, value }) => {
        setReceived(value.data.subscribe.data);
      },
      error: (error) => console.warn(error),
    });
    return () => subscription.unsubscribe();
  }

  if (received) {
    data = JSON.parse(received);
  }

  //Display pushed data on browser
  return (
    <div className="App">
      <header>
        <p>Send/Push JSON to channel `{channel}`...</p>
        <button
          name="btnChannel1"
          type="button"
          value="channel1"
          disabled={channel}
          onClick={(e) => subscript(e.target.value)}
        >
          channel1
        </button>
        <button
          name="btnChannel2"
          type="button"
          value="channel2"
          disabled={channel}
          onClick={(e) => subscript(e.target.value)}
        >
          channel2
        </button>
        <form onSubmit={publish}>
          <textarea
            rows="5"
            cols="60"
            name="description"
            value="Enter valid JSON here... (use quotes for keys and values)"
            onChange={(e) => setSend(e.target.value)}
          ></textarea>
          <br />
          <button name="btnSubmit" type="submit" disabled={!channel}>
            Publish
          </button>
        </form>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </header>
    </div>
  );
}

export default App;
