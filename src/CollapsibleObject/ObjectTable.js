import React, { Component } from 'react';
import Collapsible from 'react-collapsible';
import CollapsibleObject from './index';
import collapsibleConfig from './config';

const maxPropsToShow = 8;

/*
interface ObjectTableProps = {
    obj: Object,
    _alreadyDisplayedObjects: WeakSet   // used for detecting circular object references
};
*/

export default class ObjectTable extends Component {
    state = {
        showAllProps: false,
        remainingPropsHeight: 0,
    };

    firstPropsTable = null;
    remainingPropsTable = null;
    remainingPropsContainer = null;

    static propTypes = {
        //custom prop type because we want to allow null but forbid undefined
        obj(props, propName) {
            if (typeof props.obj !== 'object') {
                return Error("'obj' prop must be an object")
            }
        }
    }

    static defaultProps = {
        //use a getter so it returns a new WeakSet() (rather than the same one) whenever _alreadyDisplayedObjects is not explicitly passed as a prop
        get _alreadyDisplayedObjects() {
            return new WeakSet();
        }
    }

    constructor(props) {
        super(props);
        this.checkForCircularRef(props.obj);
    }

    checkForCircularRef(obj) {
        const { _alreadyDisplayedObjects: displayedObjects } = this.props;
        if (obj === null) {
            this.isCircularReference = false;
            return;
        }

        const isCircular = displayedObjects.has(obj)
        if (!isCircular) {
            displayedObjects.add(obj);
        }
        this.isCircularReference = isCircular;
    }

    toggleRemainingProps = () => {
        const showAllProps = !this.state.showAllProps;
        const triggerLinkHeight = 40;
        const expandedHeight = (this.remainingPropsTable.offsetHeight + triggerLinkHeight) + 'px';

        this.setState({
            showAllProps,
            remainingPropsHeight: expandedHeight
        });

        if (!showAllProps) {
            setTimeout(() => {
                this.setState({
                    remainingPropsHeight: 0
                });
            }, 0);
        }
    }

    handleRemainingPropsTransitionEnd = () => {
        if (this.state.showAllProps) {
            this.setState({
                remainingPropsHeight: 'auto'
            });
        }
    }

    componentDidMount() {
        this.alignTables();
    }

    componentWillUpdate({ obj }) {
        if (obj !== this.props.obj) {
            this.checkForCircularRef(obj);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.obj !== prevProps.obj) {
            this.alignTables();
        }
    }

    /**
     * If the object has more than `maxPropsToShow` properties, align the table columns
     * so that the first set of properties and the remaining properties line up.
     */
    alignTables() {
        if (!this.remainingPropsTable) {
            return;
        }
        const tables = [this.firstPropsTable, this.remainingPropsTable];
        const widths = tables.map((table) => {
            const firstTh = table.querySelector('th');
            return firstTh && firstTh.offsetWidth;
        })
        const maxWidth = Math.max(...widths);

        tables.forEach(table => {
            const firstTh = table.querySelector('th');
            if (firstTh) {
                firstTh.style.width = maxWidth + 'px';
            }
        });
    }

    render() {
        const { obj, _alreadyDisplayedObjects } = this.props;
        const { showAllProps, remainingPropsHeight } = this.state;
        const { isCircularReference } = this;

        const propNames = Object.keys(obj).filter((key) => key !== '__typename'),
            alwaysVisiblePropNames = propNames.slice(0, maxPropsToShow),
            remainingPropNames = propNames.slice(maxPropsToShow);

        return (
            <div className={'object-table-container' + (remainingPropNames.length ? ' has-additional-props': '')}>
                {isCircularReference && (
                    <div><em>(note: circular reference, so not showing nested properties...)</em></div>
                )}
                <table ref={el => this.firstPropsTable = el} className="object-table">
                    <tbody>
                        {alwaysVisiblePropNames.map((key) => (
                            <tr key={key}>
                                <th>{key}</th>
                                <td><PropertyValue val={obj[key]} recurseNestedObjects={!isCircularReference} _alreadyDisplayedObjects={_alreadyDisplayedObjects} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {remainingPropNames.length > 0 && !showAllProps && (
                    <a href="javascript:;" className="Collapsible__trigger show-more" onClick={this.toggleRemainingProps}>Show more...</a>
                )}
                {remainingPropNames.length > 0 && (
                    <div ref={el => this.remainingPropsContainer = el}
                        className="remaining-props"
                        style={{height: remainingPropsHeight}}
                        onTransitionEnd={this.handleRemainingPropsTransitionEnd}
                    >
                        <table ref={el => this.remainingPropsTable = el}>
                            <tbody>
                                {remainingPropNames.map((key) => (
                                    <tr key={key}>
                                        <th>{key}</th>
                                        <td><PropertyValue val={obj[key]} recurseNestedObjects={!isCircularReference} _alreadyDisplayedObjects={_alreadyDisplayedObjects} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <a href="javascript:;" className="Collapsible__trigger show-less" onClick={this.toggleRemainingProps}>Show less...</a>
                    </div>
                )}
            </div>
        );
    }
}

function PropertyValue({ val, recurseNestedObjects = true, _alreadyDisplayedObjects }) {
    switch (typeof val) {
        case 'object':
            if (Array.isArray(val)) {
                if (!val.length) {
                    return <div className="empty-array">Empty Array</div>;
                }
                if (!recurseNestedObjects) {
                    return '[Array]'
                }
                if (typeof val[0] === 'object') {
                    return (
                        <Collapsible trigger="Array" className="array" openedClassName="array" {...collapsibleConfig}>
                            {val.map((obj, i) => <CollapsibleObject key={i} obj={obj} open _alreadyDisplayedObjects={_alreadyDisplayedObjects} />)}
                        </Collapsible>
                    );
                }
                return (
                    <ul>
                    {val.map((v, i) => (
                        <li key={i}><PropertyValue val={v} /></li>
                    ))}
                    </ul>
                );
            }
            else if (!recurseNestedObjects && val !== null) {  // null is handled by CollapsibleObject
                return `[object ${val.__typename || val.constructor.name}]`
            }
            return <CollapsibleObject obj={val} _alreadyDisplayedObjects={_alreadyDisplayedObjects} />;
        case 'boolean':
            return val ? 'true': 'false';
        default:
            return val;
    }
};
