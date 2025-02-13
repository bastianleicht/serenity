describe("parsing freestanding async functions", () => {
    test("simple", () => {
        expect(`async function foo() {}`).toEval();
        expect(`async
        function foo() {}`).not.toEval();
    });
    test("await expression", () => {
        expect(`async function foo() { await bar(); }`).toEval();
        expect(`async function foo() { await; }`).not.toEval();
        expect(`function foo() { await bar(); }`).not.toEval();
        expect(`function foo() { await; }`).toEval();
    });
});

describe("parsing object literal async functions", () => {
    test("simple", () => {
        expect(`x = { async foo() { } }`).toEval();
        expect(`x = { async
                foo() { } }`).not.toEval();
    });
    test("await expression", () => {
        expect(`x = { foo() { await bar(); } }`).not.toEval();
        expect(`x = { foo() { await; } }`).toEval();
        expect(`x = { async foo() { await bar(); } }`).toEval();
        expect(`x = { async foo() { await; } }`).not.toEval();
    });
});

describe("parsing classes with async methods", () => {
    test("simple", () => {
        expect(`class Foo { async foo() {} }`).toEval();
        expect(`class Foo { static async foo() {} }`).toEval();
        expect(`class Foo { async foo() { await bar(); } }`).toEval();
        expect(`class Foo { async foo() { await; } }`).not.toEval();
        expect(`class Foo { async constructor() {} }`).not.toEval();
    });
});

test("function expression names equal to 'await'", () => {
    expect(`async function foo() { (function await() {}); }`).toEval();
    expect(`async function foo() { function await() {} }`).not.toEval();
});

test("async function cannot use await in default parameters", () => {
    expect("async function foo(x = await 3) {}").not.toEval();
    expect("async function foo(x = await 3) {}").not.toEval();

    // Even as a reference to some variable it is not allowed
    expect(`
        var await = 4;
        async function foo(x = await) {} 
    `).not.toEval();
});

describe("async arrow functions", () => {
    test("basic syntax", () => {
        expect("async () => await 3;").toEval();
        expect("async param => await param();").toEval();
        expect("async (param) => await param();").toEval();
        expect("async (a, b) => await a();").toEval();

        expect("async () => { await 3; }").toEval();
        expect("async param => { await param(); }").toEval();
        expect("async (param) => { await param(); }").toEval();
        expect("async (a, b) => { await a(); }").toEval();

        expect(`async
                () => await 3;`).not.toEval();

        expect("async async => await async()").toEval();
        expect("async => async").toEval();
        expect("async => await async()").not.toEval();

        expect("async (b = await) => await b;").not.toEval();
        expect("async (b = await 3) => await b;").not.toEval();

        // Cannot escape the async keyword.
        expect("\\u0061sync () => await 3").not.toEval();

        expect("for (async of => {};;) {}").toEval();
        expect("for (async of []) {}").not.toEval();
    });

    test("async within a for-loop", () => {
        let called = false;
        // Unfortunately we cannot really test the more horrible case above.
        for (
            const f = async of => {
                return of;
            };
            ;

        ) {
            expect(f(43)).toBeInstanceOf(Promise);

            called = true;
            break;
        }
        expect(called).toBeTrue();
    });
});

test("basic functionality", () => {
    test("simple", () => {
        let executionValue = null;
        let resultValue = null;
        async function foo() {
            executionValue = "someValue";
            return "otherValue";
        }
        const returnValue = foo();
        expect(returnValue).toBeInstanceOf(Promise);
        returnValue.then(result => {
            resultValue = result;
        });
        runQueuedPromiseJobs();
        expect(executionValue).toBe("someValue");
        expect(resultValue).toBe("otherValue");
    });

    test("await", () => {
        let resultValue = null;
        async function foo() {
            return "someValue";
        }
        async function bar() {
            resultValue = await foo();
        }
        bar();
        runQueuedPromiseJobs();
        expect(resultValue).toBe("someValue");
    });
});

describe("non async function declaration usage of async still works", () => {
    test("async as a function", () => {
        function async(value = 4) {
            return value;
        }

        expect(async(0)).toBe(0);

        // We use eval here since it otherwise cannot find the async function.
        const evalResult = eval("async(1)");
        expect(evalResult).toBe(1);
    });

    test("async as a variable", () => {
        let async = 3;

        const evalResult = eval("async >= 2");
        expect(evalResult).toBeTrue();
    });
});
