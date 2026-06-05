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