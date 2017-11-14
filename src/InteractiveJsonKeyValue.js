import React from 'react';
import './InteractiveJsonDocument.css';

const CURLY_OPEN = `{`;
const CURLY_CLOSE = `}`;

class InteractiveJsonKeyValue extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { property, value, indentSize=0, drawTrailingComma } = this.props;
        const indent = ' '.repeat(indentSize);
        const trailingComma = drawTrailingComma ? ',' : '';

        let content;
        if (typeof value === 'string') {
            content = <span>{`"${property}": "${value}"${trailingComma}`}</span>;
        } else if (typeof value === 'boolean') {
            content = <span>{`"${property}": ${value}${trailingComma}`}</span>;
        } else if (value instanceof Array) {
            if (value.length === 0) {
                content = `[]${trailingComma}`;
            } else if (typeof value[0] === 'string') {
                content = [<span>{`"${property}": [`}</span>];
                value.forEach((str, index) => {
                    content.push(<div key={str}>
                        <span style={{display: 'inline-block'}}>{indent}</span>
                        <div style={{display: 'inline-block'}}>{`"${str}"${index < value.length-1 ? ',' : ''}`}</div>
                    </div>);
                });
                content.push(<span>{`]${trailingComma}`}</span>);
            } else if (value[0] instanceof Object) {
                content = [<span>{`"${property}": [${CURLY_OPEN}`}</span>];
                value.forEach((obj, index) => {
                    Object.keys(obj).forEach((property, pindex, parr) => {
                        content.push(<InteractiveJsonKeyValue
                            property={property}
                            value={obj[property]}
                            indentSize={indentSize}
                            key={property}
                            drawTrailingComma={pindex < parr.length-1}
                        />);
                    })
                    if (index < value.length-1) {
                        content.push(`}, {`);
                    }
                });
                content.push(<span>{`${CURLY_CLOSE}]${trailingComma}`}</span>);
            } else {
                throw new Error(`Cannot handle this value: ${value}`);
            }
        } else if (value instanceof Object) {
            content = [
                <span>{`"${property}": ${CURLY_OPEN}`}</span>,
                Object.keys(value).map((property, index, arr) => {
                    return (<InteractiveJsonKeyValue
                        property={property}
                        value={value[property]}
                        indentSize={indentSize}
                        key={property}
                        drawTrailingComma={index < arr.length-1}
                    />);
                }),
                <span>{CURLY_CLOSE}{}</span>,
            ];
        } else {
            throw new Error(`Cannot handle this value: ${value}`);
        }
        return (<div>
            <span>{indent}</span>
            <div style={{display: 'inline-block'}}>
                {content}
            </div>
        </div>);
    }
}

export default InteractiveJsonKeyValue;
