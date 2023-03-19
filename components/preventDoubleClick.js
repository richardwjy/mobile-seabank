let isCalled = false
let timer

export const preventDoubleClick = (functionToBeCalled, interval = 1000) => {
    if (!isCalled) {
        isCalled = true;
        clearTimeout(timer)
        timer = setTimeout(() => {
            isCalled = false
        }, interval)
        return functionToBeCalled()
    }
}