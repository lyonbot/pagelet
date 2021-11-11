# Macro

1. Make components, flows easier to configure.
2. Introduce _Macro_ to concisely describe blocks or pages, which can also eject to detailed code.
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

There are lots of benefits, if we can write code like `<InputBoxMacro bind:model={state.name} />`:

- Concise code
- Friendly to low-code
- Easy to maintain, especially to non-professional users
- Can be transformed to full code, for further developing

### Challenges to Macros

#### TL,DR

1. Expressions are passed as expressions, not values -- how to remind users?

2. Use macro with **identifiable new syntax** or **regular syntax**?

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

If you are allowed to sacrifice some flexibility, a tailored form or dropdown box can be made to fill the properties of _Macros_. Users can only make values that fit most scenarios.

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

Generally you must gather sufficient information before writing the business code and using _Macro_. The information could contain data structures, API protocols and visual styles.

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

As for the situations that information _must be dynamic_, only the evil all-in-one components can save you. But, beware the boundary of ability. Once the form / table need to be customized too much, please generate a Macro, eject code, modify and deliver a _business-specified big component_. Do not ask the _all-in-one components_ for too much.

## Write a Macro

### Layout Macro

Input:

- props

Output:

- imports:
- global variables / constants:
- state variables: mounted to the composed component
- main code snippet: the jsx part

Annotations:

- some props are

### Logic Flow Macro

Input:

- props

Output:

- imports:
- global variables / constants:
- state variables:
- main code snippet: the statements

## Use Macro in Code

The code is very similar to normal JavaScript. All you have to do is follow the rules:

1.  _composites_ are explicitly wrapped by `ComposedFunction`, `ComposedComponent` pseudo functions

    -- Make AST analyzing easier to locate composites and maintain the _composite stack_ in compile time.

2.  you can use macros like _function_ or _JSXElement_

### Use Macro like Function

```jsx
const MyCallback = ComposedFunction(async () => {
  await test();
  await test2();

  {
    macro("request");

    url: "http://example.com";
    timeout: 3000;
    before: async () => {};
    writeResultTo: window.someVariable;
  }
});
```

### Use Macro like JSXElement

is the way to use macros.

- It's legal expression syntax
- a `macro:` namespace is required
- Make AST analyzing easier to locate macros
- The eye-catching syntax highlights their specialty, if you directly read the code.
- It differs from

```jsx
const MyPage = ComposedComponent({
  setup() {
    // ....
  },
  render() {
    return (
      // use a "layout macro"
      <macro:card-list list={array}>
        <item>
          <macro:card
            style="theme1"
            title={"Hello World"}
            description={item.bar}
            icon={item.icon}
          />
        </item>
      </macro:card-list>
    );
  },
});
```

## Run macro without compiling

No, you can't.

DO NOT IMAGINE ANYTHING IN RUNTIME!

you might want to forge a JSX createElement method to:

- ~~actually execute "logic flow macro" in `ComposedFunction`~~ -- impossible, because props are computed as RValue, which cannot satisfy Macro's "pass as code" requirement.

- ~~do a pre-render before `ComposedComponent` returns~~ -- no, it's impossible because `render()` may contains some dynamic expressions depending component instance.

## Compile: Compose the final code

Now let's make a _composite_ -- a JS module, a component class, a functional component, a JS function ...

Each kind of composite has different slots. For example, the untransformed code that contains Macro looks like this:

```jsx
const myReactComponent = ComposedReactFunctionalComponent(function (props) {
  //--------------------------------
  // slot for state variables, computed variables, lifecycle hooks, callbacks and more
  // they will become hooks
  //--------------------------------

  return (
    <div>
      <Macro1 />
      <Macro2 />
      ...
    </div>
  );
});
```

```jsx
const myVue3Component = ComposedVue3Component({
  setup(props) {
    //--------------------------------
    // slot for state variables, computed variables, lifecycle hooks, callbacks and more
    // they will become Vue.ref, Vue.reactive, Vue.computed ...
    //--------------------------------

    return {
      // a composed object is presented here
    };
  },
  render() {
    return (
      <div>
        <Macro1 />
        <Macro2 />
        ...
      </div>
    );
  },
});
```

### Composite Stack

In a JS module, _various kinds of composites_ may contain others. For example, a composed component may contain composed functions.

While generating JS module code, we use DFS to visit and recursively transform AST nodes. A _stack_ is maintained so current _Macro_ may insert something to parent composites' slots. For example:

- _Layout Macro_ turn static props into constants and hoist them from `render()` level to component level, or the JS module level.

Meanwhile _Macros_ can also check whether they are placed properly. Some example rules:

- _Layout Macro_ must be directly used in a _composed component_
- _**(debounced)** Function Macro_ must be used in a _composed component_ so that timers can be independent from each component instance.

### Nested Macro

For example, in this code:

```jsx
let x = 
<macro:card-list>
  <item>
    
  </item>
</macro:card-list>
```

The `<macro:card>` is 
