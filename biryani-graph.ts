import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { writeFileSync } from "node:fs";

/**
 * Cut the vegetables
 */
function cutTheVegetables(state: any) {
    console.log('Cutting the vegetables....');
    return state;
}

/**
 * Boil the Rice
 */
function boilTheRice(state: any) {
    console.log('Boiling the Rice...');
    return state;
}

/**
 * Add the salt
 */
function addTheSalt(state: any) {
    console.log('Adding the salt...');
    return state;
}

/**
 * Taste the Biryani
 */

function tasteTheBiryani(state: any) {
    console.log('Tasting the Biryani...');
    console.log("state:-", state);

    return state;
}

function whereToGo() {
    return Math.random() > 0.5 ? "addTheSalt" : "__end__";
}

const graph = new StateGraph(MessagesAnnotation)
    .addNode("cutTheVegetables", cutTheVegetables)
    .addNode("boilTheRice", boilTheRice)
    .addNode("addTheSalt", addTheSalt)
    .addNode("tasteTheBiryani", tasteTheBiryani)
    .addEdge("__start__", "cutTheVegetables")
    .addEdge("cutTheVegetables", "boilTheRice")
    .addEdge("boilTheRice", "addTheSalt")
    .addEdge("addTheSalt", "tasteTheBiryani")
    .addConditionalEdges("tasteTheBiryani", whereToGo, {
        __end__: END,
        addTheSalt: "addTheSalt"
    })

const biryaniProcess = graph.compile();

async function main() {
    /**
  * Graph visualization
  */
    const drawableGraphGraphState = await biryaniProcess.getGraph();
    const graphStateImage = await drawableGraphGraphState.drawMermaidPng();
    const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

    const filePath = './biryaniState.png';
    writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));

    /**
     * Run the graph
     */
    const result = await biryaniProcess.invoke({
        messages: [

        ],
    });

    console.log("Final: ", result);
}

main();