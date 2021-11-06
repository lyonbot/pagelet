# Pagelet

1. Make components, flows easier to configure.
2. Introduce *Macro* to concisely describe blocks or pages, which can also eject to detailed code.
3. Provide a better way to make a low-code platform.

## Concept

### Macro

Instead of HOC (High-order Component), a _Macro_ executes and returns a piece of code. It works while compiling and the generated code will substitute the macro code.

So in general, _Macro_ is something like _Syntactic Sugar_ but it is much similar to the normal code -- hardly new syntax is introduced. Sometimes you can even treat a macro as regular function or component, with some "auto-inlining" magics:

```jsx
<InputBoxMacro bind:model={state.name} />

// becomes
// note the generated `onChange` handler

<Input
  value={state.name}
  onChange={ev => { state.name = ev.target.value}}
/>
```

That's one reason that [Vue](https://vuejs.org/) and [alpine.js](https://alpinejs.dev/) get viral in small and medium-sized projects. People love their `x-model` syntax sugar!

If our code can be like `<InputBoxMacro bind:model={state.name} />`, we can gain lots of benefits:

- Code become more concise
- Friendly to low-code
- Easy to maintain, especially to non-professional users
- Can be ejected (aka. unfolded, expanded) to detailed code.

### Challenges to Macros

#### instructions and illegal property values

_Macros_ help you write code, but the way it works is not robust or intelligent -- just simply assembles strings.

```jsx
<InputBoxMacro bind:model={state.name || 'unknown'} />

// becomes a disaster :(

<Input
  value={state.name || 'unknown'}
  onChange={ev => { state.name || 'unknown' = ev.target.value}}
/>
```

Hence you must timely provide detailed instructions, and checks, if possible. You can find some inspirations from type-checking, generic constraints and AST analyzing.

If you are allowed to sacrifice some flexibility, a tailored form or dropdown box can be made to fill the properties of *Macros*. Users can only make values that fit most scenarios.

#### multiple parts in various places

Due to frameworks and programming styles, the generated code might need to be separated into pieces, which makes traditional _Macro_ hardly applicable.

```jsx
function MyForm() {
  return (
    <FormItem label="name">
      <InputBoxMacro bind:model={state.name} />
    </FormItem>
  );
}

// becomes
// note the hook part, it is appended before `return`

function MyForm() {
  // generated event handler
  const handleChange1 = useCallback((ev) => {
    state.name = ev.target.value;
  }, []);

  return (
    <FormItem label="name">
      <Input value={state.name} onChange={handleChange1} />
    </FormItem>
  );
}
```

#### runtime and compile time

Generally you must gather sufficient information before writing the business code and using *Macro*. The information could contain data structures, API protocols and visual styles.

However most low-code platforms, dynamic forms and UI components get the information in runtime, not compile time. They work seamlessly as if a final universal solution.

Their fancy demos can mislead pioneers who want to revolutionize the development process. Once you want to make some modifications to a detail of the encapsulated component, you have to:

- ask component maintainer to add props so you can customize
- fork and make a modified version of the component
- write hacky code, including monkey patches, DOM manipulations and CSS overriding
- make something entirely new

The procedure could be tortuous. To avoid this problem, some all-in-one components (eg. tables and forms with no slot) can be replaced with Macros. If user want to customize, they can turn into code that composed by smaller Macros and atom components.

We separated components into two kinds: "all-in-one components" and "atom components".

- Atom components (eg. button, input-box, selector, avatar) are so small and general that you hardly have to break them up.
- All-in-one components are evil. They covers many cases but once your case gets uncovered, you (and the components' maintainers) will suffer a lot.

The threshold to distinguish is hard to determine. You can check-out some famous UI component libraries, read real business pages' code and draw some conclusions.

As for the situations that information *must be dynamic*, only the evil all-in-one components can save you. But, beware the boundary of ability. Once the form / table need to be customized too much, please generate a Macro, eject code, modify and deliver a *business-specified big component*. Do not ask the *all-in-one components* for too much.
