const PLACEHOLDER_ROWS = [0, 1, 2];
const PLACEHOLDER_WIDTHS = ['w-32', 'w-8', 'w-28', 'w-40', 'w-24', 'w-20'];

export function RsvpTableLoadingRows() {
  return (
    <>
      {PLACEHOLDER_ROWS.map((row) => (
        <tr key={row} className="border-b-2 border-sertao-brown last:border-b-0">
          {PLACEHOLDER_WIDTHS.map((width) => (
            <td key={width} className="px-4 py-3 align-middle">
              <span className={`block h-4 rounded-none bg-sertao-brown ${width}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
