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