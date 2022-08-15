---
title: Hello World
date: "2022-08-11T22:12:03.284Z"
description: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
image:
  src: /images/blog/demo.jpg
  alt: "Rocket"
---

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

Paragraph text

This is a line break:

HR:

---

This is a paragraph: It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).

This is a inline `quote` snippet

This is a **strong** word

This is a ~~strikethrough~~ word

This is a _italic_ word

This is a **_bold italic_** word

This is a [link](/#) inline

This is a link inside of a code snippet [`link`](/#)

This is an unordered list:

- Two
- One
- Three

This is an ordered list:

1.  One
2.  Two
3.  Three

Nested List:

- One
  - A
  - B
- Two
  - C

Task List:

- [x] Hello
- [ ] World

> This is a multiline block quote:
> It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
> The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters,

This is an emoji inline 😆

# This is an emoji heading 🗿

This is an image:
![Chinese Salty Egg](/example.jpeg "hello")

This is a code block with js highlighting and multiple lines highlighted with no line numbers

```js[class="line-numbers"][class="hide-numbers"][data-line="3,8-10"]
class Shape {
  draw() {
    console.log("Uhhh maybe override me");
  }
}

class Circle {
  draw() {
    console.log("I'm a circle! :D");
  }
}
```

This is a code block with js highlighting and multiple lines highlighted with line numbers

```typescript[class="line-numbers"][data-line="3,8-10"]
interface User {
  name: string;
  id: number;
}

class UserAccount {
  name: string;
  id: number;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}

const user: User = new UserAccount("Murphy", 1);
```

This is a code block with line numbers

```js[class="line-numbers"]
const hi () => {
  console.log('hi');
}
```

Haskell

```haskell[class="line-numbers"]
main :: IO ()
main = putStrLn "Hello, World!"
```
