# MathWriter
Digitial scratch paper for working out simple math problems.

## About this project
MathWriter is an experimental web application designed to simulate the experience of working out math problems on paper. 
Users are given a grid to write on, either with mouse or touch input. Handwritten input is then cleaned up using the MyScript Handwriting Recognition service.

While there many greate tools out there for transcribing math problems on a computer there is still no real for scratch paper.
The goal of this project is to figure out a way to be more accessible than everyday scratch paper while still maintaing the natural feeling of writing things out. 

## Installation
If you would like to try running this application you will need to create a MyScript account and get an application key. 
Go to: (https://www.myscript.com/) 

You will also neet to have Node.js installed.

Once you have those, navigate to this projact director in Terminal or Command Line and run the following:

```bash
npm install
```

## How to use it
Once the package is installed run the following command to run it.
```bash
MYSCRIPT_APPLICATION_KEY=<Replace with MyScript Application Key> node index.js
```
You should see the following response
```bash
MYSCRIPT_APPLICATION_KEY=<Replace with MyScript Application Key> node index.js
listening on *:3000
```

Then just pick the browser of your choice (Works best on desktop or tablets), and navigate to http://localhost:3000.
