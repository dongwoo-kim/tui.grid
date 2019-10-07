# Getting Started

## 🚩 Table of Contents
* [Install](#-install)
    * [Using npm](#using-npm)
    * [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
* [Usage](#-usage)
    * [Load](#load)
    * [Implement](#implement)
    * [Props](#props)
        * [data](#data)
        * [options](#options)
        * [theme](#theme)
        * [map](#map) 
    * [Event](#event)
    * [Method](#method)


## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/vue-grid
```

### Via Contents Delivery Network (CDN)

TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<script src="https://uicdn.toast.com/toast-ui.vue-grid/latest/vue-grid.js"></script>
```

## 🔡 Usage

### Load

* Using namespace

    ```js
    var Grid = toastui.Grid;
    ```

* Using module

    ```js
    // es modules
    import Grid from '@toast-ui/vue-grid'
    // commonjs require
    var Grid = require('@toast-ui/vue-grid');
    ```

* Using `<script>`
  
    If you just add javascript file to your html, you use CDN or `vue-grid.js` downloaded. Insert `vue-grid.js` with `vue` in your html like this:
    
    ```html
    <script src="https://cdn.jsdelivr.net/npm/vue"></script>
    <script src="path/to/vue-grid.js"></script>
    ```

* Using only Vue wrapper component (Single File Component)

    `vue-grid.js` has all of the tui.grid. If you only need vue wrapper component, you can use `@toast-ui/vue-grid/src/Grid.vue` like this:

    ```js
    import Grid from '@toast-ui/vue-chart/src/Grid.vue'
    ```

### Implement

First insert `<grid>` in the template or html. `rowData` and `columnData` props are required.

```html
<grid :rowData="rows" :columnData="columns" />
```

Load grid component and then add it to the `components` in your component or Vue instance.

```js
import Grid from '@toast-ui/vue-grid'

export default {
    components: {
        'grid': Grid
    },
    data() {
        return {
            rows: [ // for rowData prop
                {
                    name: 'Beautiful Lies',
                    artist: 'Birdy'
                },
                {
                    name: 'X',
                    artist: 'Ed Sheeran'
                }
            ],
            columns: [ // for columnData prop
                {
                    title: 'Name',
                    name: 'name',
                },
                {
                    title: 'Artist',
                    name: 'artist'
                }
            ]
        }
    }
}
```
or
```js
import Grid from '@toast-ui/vue-grid'

new Vue({
    el: '#app',
    components: {
        'grid': Grid
    },
    data() {
        return {
            rows: [ // for rowData prop
                {
                    name: 'Beautiful Lies',
                    artist: 'Birdy'
                },
                {
                    name: 'X',
                    artist: 'Ed Sheeran'
                }
            ],
            columns: [ // for columnData prop
                {
                    title: 'Name',
                    name: 'name',
                },
                {
                    title: 'Artist',
                    name: 'artist'
                }
            ]
        }
    }
});
```

### Props

You can use `rowData`, `columnData`, `options`, `theme` and `language` props.

* `rowData`, `columnData`

    | Type | Required |
    | --- | --- |
    | Array | O |

    These props are row and colume data of the grid. If you change `rowData` or `columnData`, the grid is rendered to change data.

    Example :

    ``` html
    <template>
        <grid :rowData="rows" :columnData="columns" />
    </template>
    <script>
    import Grid from '@toast-ui/vue-grid';

    export default {
        name: 'myGrid',
        components: {
            'grid': Grid
        },
        data() {
            return {
                rows: [ // for rowData prop
                    {
                        name: 'Beautiful Lies',
                        artist: 'Birdy'
                    },
                    {
                        name: 'X',
                        artist: 'Ed Sheeran'
                    }
                ],
                columns: [ // for columnData prop
                    {
                        title: 'Name',
                        name: 'name',
                    },
                    {
                        title: 'Artist',
                        name: 'artist'
                    }
                ]
            }
        }
    };
    </script>
    ```

* `options`

    | Type | Required |
    | --- | --- |
    | Object | X |

    You can configurate your grid using `options` prop. For more information which properties can be set in `options`, see [options of tui.grid](https://nhnent.github.io/tui.grid/api/Grid.html).

    Example:

    ``` html
    <template>
        <grid :rowData="rows" :columnData="columns" :options="options"/>
    </template>
    <script>
    import Grid from '@toast-ui/vue-grid';

    export default {
        name: 'myGrid',
        components: {
            'grid': Grid
        },
        data() {
            return {
                rows: [
                    // ... omit
                ],
                columns: [ 
                    // ... omit
                ],
                options: {
                    scrollX: false,
                    scrollY: false,
                    rowHeight: 30,
                    rowHeaders: ['checkbox']
                }
            }
        }
    };
    </script>
    ```

* `theme`

    | Type | Required |
    | --- | --- |
    | Strinf or Object | X |

    This prop can change theme of the chart. We support `default`, `striped` and `clean` themes. So in case you just set `String` of these themes.

    If you want to use other theme, you set `Object` that is required `name` and `value`. For more information which properties of `value` are available, see `extOptions` of [applyTheme of tui.grid](https://nhnent.github.io/tui.grid/api/Grid.html#.applyTheme).

    Example using `String`:

    ``` html
    <template>
        <grid :rowData="rows" :columnData="columns" :theme="striped"/>
    </template>
    <script>
    import Grid from '@toast-ui/vue-grid';

    export default {
        name: 'myGrid',
        components: {
            'grid': Grid
        },
        data() {
            return {
                rows: [
                    // ... omit
                ],
                columns: [ 
                    // ... omit
                ]
            }
        }
    };
    </script>
    ```

    Example using `Object`:

    ``` html
    <template>
        <grid :rowData="rows" :columnData="columns" :theme="myTheme"/>
    </template>
    <script>
    import Grid from '@toast-ui/vue-grid';

    export default {
        name: 'myGrid',
        components: {
            'grid': Grid
        },
        data() {
            return {
                rows: [
                    // ... omit
                ],
                columns: [ 
                    // ... omit
                ],
                myTheme: {
                    name: 'myTheme',
                    value: {
                        cell: {
                            normal: {
                                background: '#00ff00',
                                border: '#e0e0e0'
                            },
                            head: {
                                background: '#ff0000',
                                border: '#ffff00'
                            },
                            editable: {
                                background: '#fbfbfb'
                            }
                        }
                    }
                }
            }
        }
    };
    </script>
    ```

* `language`

    | Type | Required |
    | --- | --- |
    | String or Object | X |

    This prop can change language of the chart. We support `en` and `ko`. So in case you just set `String` of these languages.

    If you want to use other languages, you set `Object` that is required `name` and `value`. For more infomation which properties of `value` are available, see `data` of [setLanguage of tui.grid](https://nhnent.github.io/tui.grid/api/Grid.html#.setLanguage).

    Example using `String`:

    ```html
    <template>
        <grid :rowData="rows" :columnData="columns" :theme="ko"/>
    </template>
    <script>
    import Grid from '@toast-ui/vue-grid';

    export default {
        name: 'myGrid',
        components: {
            'grid': Grid
        },
        data() {
            return {
                rows: [
                    // ... omit
                ],
                columns: [ 
                    // ... omit
                ]
            }
        }
    };
    </script>
    ```

    Example using `Object`:

    ```html
    <template>
        <grid :rowData="rows" :columnData="columns" :language="myLang"/>
    </template>
    <script>
    import Grid from '@toast-ui/vue-grid';

    export default {
        name: 'myGrid',
        components: {
            'grid': Grid
        },
        data() {
            return {
                rows: [
                    // ... omit
                ],
                columns: [ 
                    // ... omit
                ],
                myLang: {
                    name: 'en-US',
                    value: {
                        display: {
                            noData: 'No data.',
                            loadingData: 'Loading data.',
                            resizeHandleGuide: 'You can change the width of the column by mouse drag, ' +
                                                'and initialize the width by double-clicking.'
                        },
                        net: {
                            confirmCreate: 'Are you sure you want to create {{count}} data?',
                            confirmUpdate: 'Are you sure you want to update {{count}} data?',
                            confirmDelete: 'Are you sure you want to delete {{count}} data?',
                            confirmModify: 'Are you sure you want to modify {{count}} data?',
                            noDataToCreate: 'No data to create.',
                            noDataToUpdate: 'No data to update.',
                            noDataToDelete: 'No data to delete.',
                            noDataToModify: 'No data to modify.',
                            failResponse: 'An error occurred while requesting data.\nPlease try again.'
                        }
                    }
                }
            }
        }
    };
    </script>
    ```

### Event

* click : Occurs when a mouse button is clicked on the Grid.
* check : Occurs when a checkbox in row header is checked.
* uncheck : Occurs when a checkbox in row header is unchecked.
* dblclick : Occurs when a mouse button is double clicked on the Grid.
* mouseover : Occurs when a mouse pointer is moved onto the Grid.
* mouseout : Occurs when a mouse pointer is moved off from the Grid.
* mousedown : Occurs when a mouse button is downed on the Grid.
* focusChange : Occurs when focused cell is about to change.
* expanded : Occurs when the row having child rows is expanded.
* expandedAll : Occurs when all rows having child rows are expanded.
* collapsed : Occurs when the row having child rows is collapsed.
* collapsedAll : Occurs when all rows having child rows are expanded.
* beforeRequest : Occurs before the http request is sent.
* response : Occurs when the response is received from the server.
* successResponse : Occurs after the response event, if the result is true.
* failResponse : Occurs after the response event, if the result is false.
* errorResponse : Occurs after the response event, if the response is Error.
* selection : Occurs when selecting cells.
* deleteRange : Occurs when cells are deleted by 'del' key.

For more information such as the parameters of each event, see [event of tui.grid](https://nhnent.github.io/tui.grid/api/Grid.html).

Example :

```html
<template>
    <grid
        :rowData="rows"
        :columnData="columns"
        @click="onClick"
        @check="onCheck"
    />
</template>
<script>
import Grid from '@toast-ui/vue-grid';

export default {
    name: 'myGrid',
    components: {
        'grid': Grid
    },
    data() {
        return {
            rows: [
                // ... omit
            ],
            columns: [ 
                // ... omit
            ]
        }
    },
    methods: {
        onClick(nativeEvent, targetType, rowKey, columnName, instance) {
            // implement your code
        },
        onCheck(rowKey, instance) {
            // implement your code
        }
    }
};
</script>
```

### Method

For use method, first you need to assign `ref` attribute of element like this:

```html
<grid ref="tuiGrid" :rowData="rows" :columnData="columns"/>
```

After then you can use methods through `this.$refs`. We provide `getRootElement` and `invoke` methods.

* `getRootElement`

    You can get root element of grid using this method.

    ```js
    this.$refs.tuiGrid.getRootElement();
    ```

* `invoke`

    If you want to more manipulate the Grid, you can use `invoke` method to call the method of tui.grid. First argument of `invoke` is name of the method and second argument is parameters of the method. To find out what kind of methods are available, see [method of tui.grid](http://nhnent.github.io/tui.grid/api/Grid.html).

    ```js
    const info = this.$refs.tuiGrid.invoke('getFocusedCell');
    this.$refs.tuiGrid.invoke('setWidth', 500);
    ```
