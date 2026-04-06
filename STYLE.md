# Style

Best practices for names, writing documentation, etc. If there is ever a very strong case to break one of these conventions, make note that the convention is broken with "STYLE: explanation" in a comment or parenthesis if already inside a comment. This way, I can notice the convention was broken, understand why, and update the conventions for this case if need be.

## Coding Practices

- In dynamically typed languages, reassigning a variable name to another type should be avoided.
- Single line if statements should only be used when followed by jump statements.
- Non-arrow functions should always be multi-line.
- Arrow functions may be multi-line if appropriate.

## Naming

In this section, I will refer to "structures", this means a type like a dictionary, list, set, array etc. I will also refer to data, this refers to types like a string, integer, or boolean.

### General Rules

Long names are perfectly fine. We have powerful IDEs with tab completion.

- Avoid making one name a substring of another. Especially within the same scope.
- Avoid using the word "type" in names.
- Avoid abbreviations.

### Functions

- Function names should start with a verb.
- It is acceptable to use conjunctions in function names.

Some common verbs and their use in function names:

| Verb | Use |
| - | - |
| get | Getters on a class |
| set | Setter on a class |
| any form of "to be" | returns a boolean |
| fetch | Access an external resource. This includes HTTP GET. |
| transform | takes a structure and returns the same data in a new shape |
| filter | takes a structure and returns reduced data in the same shape |
| extract | transforms and filters a structure |
| parse | takes a string and returns data or a structure |
| validate | throws an error if some condition is not met |
| construct | assembles an object. Alternative to a traditional constructor. |

### Variables

- Variable names should start with a noun.

#### Booleans

- In addition to starting with a noun, boolean names should include a form of "to be".

#### Dictionary

A dictionary with "map" in the name converts between known data. Note that because "map" can be interpreted as a verb, it should not be used at the start of a variable name.

#### Collections

It is acceptable to name collections (list, array, set, etc.) with the type that they contain.

#### Strings

When naming strings that have to do with files:

- A filename does not include a path.
- A slug is the part of the filename to the left of the rightmost period.
- An extension is the part of the filename to the right of the rightmost period.
- A path does not include a filename.
- A filepath is a path and filename.

## Comments

- Use American English
- All files in `src/` should have a header explaining that file's purpose.
- Whenever a file in `src/` is updated, its header should be changed if necessary.
