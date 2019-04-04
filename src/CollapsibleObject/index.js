import React from 'react';
import Collapsible from 'react-collapsible';
import ObjectTable from './ObjectTable';
import collapsibleConfig from './config';

export default function CollapsibleObject({ obj, open, currentRecursionDepth = 0, _alreadyDisplayedObjects }) {
    if (obj === null) {
        return <span className="null">null</span>;
    }
    return (
        <Collapsible trigger={obj.__typename || 'Object'} {...collapsibleConfig} open={open}>
            <ObjectTable obj={obj} _alreadyDisplayedObjects={_alreadyDisplayedObjects} />
        </Collapsible>
    );
}
