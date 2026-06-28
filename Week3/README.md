# Week 3: Integration with AI API
Welcome to Week 3 of **Agentic AI Enabled Website**! 

Now that your website has structure, style, and interactivity, it's time to give it a brain. This week, we are diving into the world of **AI APIs**. We will be connecting our application to Google’s Gemini API to dynamically generate content right inside our project. 

We will be using the Gemini API because it provides an incredibly generous **free tier** with no credit card required, making it perfect for learning! Feel free to experiment with other API platforms.  

---
Have a look at this to get a quick idea of how an API works.    
https://www.youtube.com/watch?v=4ylNDFYH2xs

## Setup
https://ai.google.dev/gemini-api/docs/quickstart 
1. Create an API Key, install the requirements as given. It can be done here.  
https://aistudio.google.com/    
3. Copy the API Key and create an environment variable storing it. This can be done by creating a **.env** file in the same folder where your js file exists.  
  ```
  API_KEY = "..." //Your API Key
  ```
3. Run this in your terminal to initialize a project in node js.
```
npm init -y
```
4. A package.json file would have been created. Edit the file, change the type from **"commonjs"** to **"module"**.  
>**Why?** Legacy Node.js uses CommonJS (require). By switching the type to "module", we unlock modern ES Modules (import), which allows us to use top-level await expressions cleanly without complex asynchronous wrappers, which is required by the standard Gemini API template.
5. Run this in your terminal to install dotenv, which would be used to read the API Key from your system environment.
```
npm install dotenv
```
6. Include this in ur js file, this is what reads ur .env file.
```
import dotenv from "dotenv"
dotenv.config()
```
7. Use the generate text template provided in the Gemini API docs in ur js file. Don't forget to include your api key in this line of the template. This is done by extracting the key from the variable you have created in the .env file.

```
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
```
>We could have directly pasted the api key here, why did we not do so?

8. Wrap the entire main function in a try catch block to handle exceptions where Gemini fails to give an output.
   
Display the generated text in a html page.
  
Try experimenting with different models, such as gemini-3.5-flash, gemini-3.1-flash-lite, etc.
## JSON Output Mode
By default, the AI returns a single block of raw paragraph text. However, if we want our website to display organized information (like a grid of feature cards, a table, or a dynamic list), parsing raw text with JavaScript is incredibly difficult.

Instead, we can instruct Gemini to return a strict JSON Object containing an array. This allows our frontend code to effortlessly parse the response and map it directly into HTML layouts!

Here is how you request a structured JSON array using the modern SDK configuration:
```
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "...", // This is where your prompt goes
  config: {
    // 1. Tell Gemini to reply with a JSON string instead of text
    responseMimeType: "application/json",
    // 2. Define the exact JSON structure you want the AI to follow
    responseSchema: {
      type: "OBJECT",
      properties: {
        projects: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              // Here go the attributes making up each data element. For example, if we need to generate two attributes, product name and price.
              product_name: { type: "STRING" },
              price: { type: "NUMBER" },
            }
          }
        }
      }
    }
  }
});

// Convert the structured JSON string into a live JavaScript Object
const data = JSON.parse(response.text);

// Now you can easily loop through the array or access indices natively!
console.log(data.projects);
```
**data.projects** is an array where each element has two attributes product_name and price.    
Now that we have extracted some data, we can display them in the website in the form of a grid by looping them over and using innerHTML in js.
## Assignment
Build up on the week 2 task manager to create a Smart Task Planner.  
- Create a box taking input from the user. The input would a goal to be achieved (ex. planning a trip to somewhere).
- Once the user clicks on a button the request should be sent to Gemini which should return an array of JSON objects containing task name, priority and estimated time.
- Display the tasks to complete the goal step wise.
- If there is an exception in fetching the output, a proper message should be displayed.  
### Optional
It takes some time to get the output from Gemini, you can display a loading state for that interval.
### Submission Format
```text
Week3/
├── index.html
├── style.css
├── script.js
└── package.json
```
>NOTE: Before uploading create a .gitignore file containing the .env file. Make sure not to keep your api key public anywhere.
