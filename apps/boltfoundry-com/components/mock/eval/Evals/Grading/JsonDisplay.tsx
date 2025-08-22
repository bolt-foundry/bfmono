import type { JSX } from "react";

interface JsonDisplayProps {
  data: unknown;
  schema?: unknown; // TODO: Use DeckDisplaySchema when available
}

export function JsonDisplay({ data, schema: _schema }: JsonDisplayProps) {
  // Helper to determine if value is a simple type
  const isSimpleValue = (value: unknown): boolean => {
    return value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean";
  };

  // Helper to render a simple key-value table
  const renderObjectAsTable = (
    obj: Record<string, unknown>,
    title?: string,
  ) => {
    const entries = Object.entries(obj);

    return (
      <div className="json-table-container">
        {title && <h4 className="table-title">{title}</h4>}
        <table className="json-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, value], index) => (
              <tr key={index}>
                <td className="key-cell">{key}</td>
                <td className="value-cell">
                  {isSimpleValue(value)
                    ? (
                      <span className={`value-${typeof value}`}>
                        {value === null ? "null" : String(value)}
                      </span>
                    )
                    : Array.isArray(value)
                    ? (
                      renderArray(value, key)
                    )
                    : (
                      renderObjectAsTable(value as Record<string, unknown>, key)
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper to render arrays
  const renderArray = (arr: Array<unknown>, title?: string) => {
    // If array contains objects with same structure, render as table
    if (
      arr.length > 0 && typeof arr[0] === "object" && arr[0] !== null &&
      !Array.isArray(arr[0])
    ) {
      const keys = Object.keys(arr[0] as Record<string, unknown>);
      const allSameStructure = arr.every((item) =>
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item) &&
        keys.every((key) => key in (item as Record<string, unknown>))
      );

      if (allSameStructure) {
        return (
          <div className="json-array-table-container">
            {title && <h4 className="table-title">{title}</h4>}
            <table className="json-array-table">
              <thead>
                <tr>
                  {keys.map((key) => <th key={key}>{key}</th>)}
                </tr>
              </thead>
              <tbody>
                {arr.map((item, index) => (
                  <tr key={index}>
                    {keys.map((key) => {
                      const itemValue = (item as Record<string, unknown>)[key];
                      return (
                        <td key={key} className="value-cell">
                          {isSimpleValue(itemValue)
                            ? (
                              <span className={`value-${typeof itemValue}`}>
                                {itemValue === null
                                  ? "null"
                                  : String(itemValue)}
                              </span>
                            )
                            : <span className="value-complex">[Object]</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Otherwise render as list
    return (
      <div className="json-array-list">
        {title && <h4 className="list-title">{title}</h4>}
        <ul>
          {arr.map((item, index) => (
            <li key={index}>
              {isSimpleValue(item)
                ? (
                  <span className={`value-${typeof item}`}>
                    {item === null ? "null" : String(item)}
                  </span>
                )
                : (
                  renderValue(item)
                )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Main render function
  const renderValue = (value: unknown, title?: string): JSX.Element => {
    if (isSimpleValue(value)) {
      return (
        <div className="json-simple-value">
          {title && <span className="value-label">{title}:</span>}
          <span className={`value-${typeof value}`}>
            {value === null ? "null" : String(value)}
          </span>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return renderArray(value, title);
    }

    return renderObjectAsTable(value as Record<string, unknown>, title);
  };

  return (
    <div className="json-display">
      {renderValue(data)}
    </div>
  );
}
