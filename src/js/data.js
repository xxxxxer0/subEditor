let metaMap = [{
    "checked": 1,
    "option": "#FFFFFF"
}, {
    "checked": 0,
    "option": "#858686"
}, {
    "checked": 0,
    "option": "#C11A22"
}, {
    "checked": 0,
    "option": "#FD6328"
}, {
    "checked": 0,
    "option": "#862395"
}, {
    "checked": 0,
    "option": "#5D389E"
}, {
    "checked": 0,
    "option": "#39489A"
}, {
    "checked": 0,
    "option": "#0D92CF"
}, {
    "checked": 0,
    "option": "#0B8278"
}, {
    "checked": 0,
    "option": "#288627"
}, {
    "checked": 0,
    "option": "#76A343"
}, {
    "checked": 0,
    "option": "#000000"
}]

let fontSizeOptions = [{
        checked: 1,
        option: '小',
        value: 12
    },
    {
        checked: 0,
        option: '中',
        value: 14
    },
    {
        checked: 0,
        option: '大',
        value: 16
    },
]

let fontPositionOptions = [{
    checked: 1,
    option: '底部',
    value: 2
}, {
    checked: 0,
    option: '顶部',
    value: 8
}, ]

function getTextShadowList() {
    let textShadowList = []
    for (let i = metaMap.length - 1; i >= 0; i--) {
        textShadowList.push(metaMap[i])
    }
    textShadowList[0].checked = 1
    textShadowList[textShadowList.length - 1].checked = 0
    return textShadowList

}

export default {
    fontColorList: JSON.parse(JSON.stringify(metaMap)),
    textShadowList: getTextShadowList(),
    fontSizeOptions,
    fontPositionOptions
}