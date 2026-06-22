# Part 5: The Difference Between .innerText and .innerHTML

Both of these tools are used to change the text inside a webpage. They look similar, but the way the computer handles them is completely different.

---

## 1. .innerText (Plain Text Only)

When you use `.innerText`, the computer treats everything you type as regular text. If you try to put formatting codes (HTML tags) inside it, the computer will not run them. It will just display the codes exactly as they are.

* **Example:**
  > Code: `box.innerText = "<b>Hello</b>";`
  > 
  > What users see on the screen: **<b>Hello</b>** (The computer displays the code itself).

* **When to use:** 
  It is **very safe**. You should always use this when showing words that users type into your website (like in a comment box). It stops bad people from putting harmful code into your website.

---

## 2. .innerHTML (The Code Translator)

When you use `.innerHTML`, the computer will actually read and understand the formatting codes. If you put HTML codes inside it, it will change the look of the text on the screen.

* **Example:**
  > Code: `box.innerHTML = "<b>Hello</b>";`
  > 
  > What users see on the screen: **Hello** (The text becomes bold, and the codes are hidden).

* **When to use:** 
  It is **powerful** when you want to create a rich layout (like adding images, links, or styles) using code.

* **Danger:** 
  It is **risky**. Never use this to display text that users type into your website. A hacker could type a bad script, and your website will run it accidentally.

---

## Summary

* **Normal text?** Always use `.innerText` (Safe and fast).
* **Want to add styles, images, or links?** Use `.innerHTML` (Be careful!).


# Part 6: Why Do We Need parseInt()?

Here is a very important lesson from real-world coding: 
The popup box `prompt()` **always** gives you information as **text** (a String). If you type the number `1`, the computer actually sees it as the text `"1"`. 

Sometimes the computer is smart enough to guess that you meant a number, but changing it into a real number on purpose using `parseInt()` will keep your code safe and stop hidden mistakes.

---

## How It Works in Real Life

When you run a code that asks for row and column numbers:
1. You click a button.
2. Box 1 pops up: You type `0` (meaning the first row).
3. Box 2 pops up: You type `1` (meaning the second column).
4. Box 3 pops up: You type "Success". 
The screen updates instantly because the computer knows exactly which box to change.

---

## What is parseInt()?

Let’s break down the name:
* **Parse:** To read and pull out.
* **Int (Integer):** A whole number (like 1, 2, 3... no dots, no fractions).

So, `parseInt()` is like a **Whole Number Extractor Machine**. You feed it text, and it tries its best to pull out a real number that you can use for math.

### The Left-to-Right Rule
Imagine this machine has a vacuum nozzle. It scans your text from **left to right**. It keeps sucking up numbers until it hits a non-number (like a letter, a space, or a dot). Then, it stops immediately and gives you what it collected.

---

## 4 Simple Examples

### 1. The Perfect Case
* **Code:** `parseInt("42")`
* **How it works:** The machine sees `4`, then `2`. End of text.
* **Result:** The number `42`.

### 2. Hitting a Dot (Decimal Number)
* **Code:** `parseInt("10.99")`
* **How it works:** The machine sees `1`, then `0`. It hits the dot `.` and **stops immediately!**
* **Result:** The number `10`. 
* *Note: It throws away everything after the dot. It does NOT round it up to 11.*

### 3. Numbers Mixed with Letters
* **Code:** `parseInt("250px")`
* **How it works:** The machine sees `2`, `5`, `0`. It hits the letter `p` and **stops immediately!**
* **Result:** The number `250`. 
* *Note: This is super useful when you want to get the size of an item on a webpage.*

### 4. Text Standing in the Way First
* **Code:** `parseInt("Price is 500")`
* **How it works:** The machine hits the letter `P` at the very beginning. It panics because there is no number to start with, so it stops.
* **Result:** `NaN`. This stands for **Not-a-Number** (meaning: "Hey, this is not a number at all!").

---

## Summary: Why does prompt() need parseInt()?

In coding, the plus sign `+` has two different superpowers:
1. **If both sides are numbers:** It adds them together (`1 + 1 = 2`).
2. **If one side is text:** It glues them together (`"1" + 1 = "11"`).

Because the popup box `prompt()` always gives you text, typing `1` gives you `"1"`. If you use this text to calculate positions, the computer will get confused and put things in the wrong place.

Wrapping your code inside `parseInt()` turns the text `"1"` into the real number `1`. This makes sure all your math is 100% correct!

# Part 8: Understanding .selectedIndex with a Real-Life Example

Imagine you are building a drop-down list (a box you click to open a list of options) for a story-reading website. Inside the box, you have a list of chapters stacked on top of each other:

* Chapter 1 (at the very top)
* Chapter 2
* Chapter 3
* Chapter 4

In the coding world, the computer does not really understand the words "Chapter 2". Instead, it manages this list just like a line of people waiting, using **Position Numbers (called Index)**. 

Crucially, computers always **start counting from 0**, not 1:

* **Chapter 1** -> Stands at position **0**
* **Chapter 2** -> Stands at position **1**
* **Chapter 3** -> Stands at position **2**
* **Chapter 4** -> Stands at position **3**

---

## The Problem & The Solution

Now, a reader scrolls down and clicks on **"Chapter 2"**. How does your code know exactly where they stopped so it can load the right story text? 

This is where `.selectedIndex` comes to help:
* **selected:** means "chosen right now".
* **index:** means "position number".

Put together, `.selectedIndex` acts like a **helpful reporter**. Whenever a reader clicks an option on the screen, this reporter immediately looks at the list and shouts to the computer system:

> "Report! The user just clicked on position number 1!"

Thanks to this number, the computer knows instantly that the user wants to read Chapter 2.

# Part 9: How to Count and Get Text from a Dropdown List

Here is the standard code to count and read all choices inside a dropdown box:

```javascript
function getOptions() {
  let listcolor = document.getElementById("colorSelect");
  let options = listcolor.options;
  let count = options.length;
  let text = "The dropdown list has " + count + " options:\n";
  
  for (let i = 0; i < count; i++) {
    text += options[i].text + "\n";
  }
  
  alert(text);
}
```
##  Line-by-Line Breakdown

### `let listcolor = document.getElementById("colorSelect");`
* **Goal:** Find and grab the whole dropdown box on the webpage.

### `let options = listcolor.options;`
* **Goal:** Gather all the choices inside that dropdown box and save them together in a list called `options`. This keeps the code neat and helps the computer run it much faster.

### `let count = options.length;`
* **Goal:** Use `.length` to count exactly how many total choices are inside that list.

### `let text = "The dropdown list has " + count + " options:\n";`
* **Goal:** Create a text "basket" (the `text` variable) to hold our final message.
* **Note:** The `\n` symbol is a special command to start a new line, so the text doesn't all crowd together on a single line.

### `for (let i = 0; i < count; i++) { ... }`
* **Goal:** Look through the choices one by one. The counter `i` represents the position number, starting at 0 and moving to the very last choice.

### `text += options[i].text + "\n";`
* **Goal (The core step):** * `options[i].text`: Pulls out the actual words shown on the screen (like "Red" or "Green") at position number `i`.
  * The `+=` sign means "add to the end". It keeps whatever is already in the text basket and glues the new choice right after it.

### `alert(text);`
* **Goal:** Show the final message (after collecting all the names) inside a popup box on the screen.

---

##  Key Rules to Remember

* The dropdown box manages its choices by numbering them starting from **0**, just like a normal list line.
* To grab the words of a choice inside a dropdown box, always use `.text` instead of `.innerText`.

##  .text vs .innerText: What is the Difference?

Even though both `.text` and `.innerText` give you the exact same word (like "Red" or "Green"), they work completely differently behind the scenes. Let's imagine it like this:

---

### 1. .innerText (The General Tool — "The Screen Reader")
* `.innerText` is a general tool that works for almost any HTML tag (like `<p>`, `<div>`, `<span>`).
* **How it works:** It acts like a person looking directly at the screen. It has to ask the design department (CSS): *"Hey, is this text hidden from the user? Is it changed to uppercase?"*. If the text is hidden on the screen, `.innerText` will return nothing (blank).
* Because it has to calculate how the webpage looks, it runs a tiny bit slower.

---

### 2. .text (The Special Privilege — "The Warehouse Worker")
* `.text` is a special tool built by the browser specifically for `<option>` tags (and a few others like link tags `<a>`).
* **How it works:** It acts like a warehouse worker. It does not care about the webpage design, and it does not care if the text is hidden or not. It goes straight inside the `<option>` box, grabs the raw text data, and pulls it out.
* Because it goes straight to the root of the data, it is faster and more accurate for `<option>` tags.

---

###  Why should you use .text for dropdown lists?

Dropdown boxes (`<select>` and `<option>`) are very unique. When you click a dropdown list, the list that pops up is actually drawn by your computer's operating system (like Windows, macOS, or iOS), not just by the webpage itself. 

*(Have you ever noticed that a dropdown box looks completely different on an iPhone compared to a Windows computer?)*

Since the operating system handles it, using the special tool `.text` is the most standard, safe, and error-free way to talk to it.

---

###  Summary

* When you want to get text from **normal tags** on a webpage (`<p>`, `<h1>`, `<div>`), use **`.innerText`**.
* When working with **choice lists** (like `<option>`), use the special tool **`.text`**.

# Part 10: Working with Input Boxes and Math

## 1. Why use .value instead of .innerText or .text?
* That for normal text tags like `<p>` or `<td>`, I use `.innerText`.
* For a dropdown choice (`<option>`), I use `.text`.
* But an input box (`<input>`) is different. It is like an empty box waiting for a user to type things into it. Whatever is typed inside is saved in a secret pocket named `.value`. Therefore, to grab data from a form input, must use `.value`.

---

## 2. Why use parseFloat() instead of parseInt()?
* In Part 6, used the `parseInt()` machine to pull out whole numbers because row and column positions cannot be decimals like 1.5 or 2.5.
* But for things like a radius, the number can easily have a dot (for example: 2.5 cm). The `parseFloat()` machine ("Float" means numbers with decimals) helps me grab the entire 2.5 without throwing away the tail.

---

## 3. Math Helpers in JavaScript
JavaScript has a built-in toolset named `Math` to help me solve math problems easily:
* `Math.PI`: This is just the pi number (3.14159...).
* `Math.pow(base, exponent)`: This is for powers. For example, `Math.pow(radius, 3)` means radius cubed (radius multiplied by itself 3 times).

---

## 4. The .toFixed(4) Scissors
* Sometimes, the calculation results in a giant, messy number like 3.141592653589793. Displaying this whole tail on the screen looks ugly.
* The `.toFixed(4)` tool acts like a pair of scissors. It cuts off the long tail and only keeps exactly 4 digits after the dot. The result becomes a clean 3.1416.

---

# Understanding `event.preventDefault()` in Simple Words

Let's forget about code for a minute and start with a real-life story.

## 1. A Simple Real-Life Example

Imagine you go to a restaurant. The normal rule here is: when a customer sits at a table (The Event), the waiter automatically brings a glass of ice tea (The Default Action).

But today, your throat hurts. You don't want ice tea. As soon as you sit down, you raise your hand and say: *"Wait, don't bring the tea, I will order water later."*

-> Raising your hand to stop the waiter is exactly what **`event.preventDefault()`** does.

In coding:
* **event**: The action (like clicking a button, or pressing a key).
* **prevent**: To stop something from happening.
* **default**: The normal, automatic reflex.

Together, `event.preventDefault()` is a command that means: *"Stop the normal reflex of the web browser, so I can handle it my way!"*

---

## 2. Why Do We Need It?

Web parts created a long time ago have old, automatic "reflexes".

* **A Form**: When you click the "Submit" button, its reflex is to reload the whole page to send data.
* **A Link (the `<a>` tag)**: When you click it, its reflex is to jump to a new page immediately.

**What is the problem?**
In modern websites, we want things to be smooth. We don't want the page to reload and clear all the information the user is typing. We want to check for errors or do math quietly in the background.

If we don't use `event.preventDefault()`, the browser will reload the page and wipe out everything. That is why we must "hit the brakes".

---

## 3. Common Times We Use It

Here are 4 common situations you will see a lot:

### Case 1: Working with Forms
When a user clicks "Calculate" or "Sign up", you want to check if their email is correct before sending anything.
* **If we don't stop it:** You click the button, the page reloads, goes blank, and all results disappear.
* **How to use it:** Stop the reload so you can show an error message or show the math result right there on the screen.

### Case 2: Links That Shouldn't Jump
Sometimes you make a "Read more" button using a link. You just want it to show some hidden text when clicked, not jump to a new page.
* **How to use it:**

```javascript
readMoreLink.addEventListener("click", function(event) {
    event.preventDefault(); // Stop jumping to a new page
    hiddenText.style.display = "block"; // Just show the hidden text
});
```

### Case 3: Making Your Own Right-Click Menu
Normally, when you right-click on a website, a boring grey menu appears (with Copy, Paste, etc.). If you are making an app like Google Drive, you want to show your own beautiful menu instead.
* **How to use it:** Use `preventDefault()` to stop the normal grey menu from showing up, and then show your own custom menu.

### Case 4: Blocking Letters in a Number Box
You have a box just for phone numbers. If the user presses a letter key (like A, B, or C), you can stop it immediately so the letter never appears in the box.

---

**Summary:** Whenever you use a web part that has an "automatic reflex" (like Forms, Links, or Right-click) and you want to control it yourself, the first thing you need to write is `event.preventDefault()`.