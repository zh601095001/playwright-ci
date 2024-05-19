import type {Page} from "@playwright/test";

const TODO_ITEMS = [
    'buy some cheese',
    'feed the cat',
    'book a doctors appointment'
];

async function createDefaultTodos(page: Page) {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    for (const item of TODO_ITEMS) {
        await newTodo.fill(item);
        await newTodo.press('Enter');
    }
}

async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
    return await page.waitForFunction(e => {
        return JSON.parse(localStorage['react-todos']).length === e;
    }, expected);
}

async function checkNumberOfCompletedTodosInLocalStorage(page: Page, expected: number) {
    return await page.waitForFunction(e => {
        return JSON.parse(localStorage['react-todos']).filter((todo: any) => todo.completed).length === e;
    }, expected);
}

async function checkTodosInLocalStorage(page: Page, title: string) {
    return await page.waitForFunction(t => {
        return JSON.parse(localStorage['react-todos']).map((todo: any) => todo.title).includes(t);
    }, title);
}

export {
    TODO_ITEMS,
    createDefaultTodos,
    checkNumberOfCompletedTodosInLocalStorage,
    checkTodosInLocalStorage,
    checkNumberOfTodosInLocalStorage,
}