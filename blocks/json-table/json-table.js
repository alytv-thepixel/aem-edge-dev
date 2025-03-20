async function createTableHeader(table, data) {
  if (!data || data.length === 0) return;

  const thead = document.createElement('thead');
  const tr = document.createElement('tr');

  const headers = Object.keys(data[0]).filter((key) => !key.startsWith(':'));
  headers.forEach((header) => {
    const th = document.createElement('th');
    th.appendChild(document.createTextNode(header));
    tr.appendChild(th);
  });

  thead.appendChild(tr);
  table.appendChild(thead);
}

async function createTableRow(table, row, headers) {
  const tbody = table.querySelector('tbody') || document.createElement('tbody');
  const tr = document.createElement('tr');

  headers.forEach((header) => {
    const td = document.createElement('td');
    td.appendChild(document.createTextNode(row[header] || ''));
    tr.appendChild(td);
  });

  tbody.appendChild(tr);
  if (!table.querySelector('tbody')) {
    table.appendChild(tbody);
  }
}

async function createTable(jsonURL, val) {
  let pathname = null;
  if (val) {
    pathname = jsonURL;
  } else {
    pathname = new URL(jsonURL);
  }

  const resp = await fetch(pathname);
  const json = await resp.json();

  // const jsonString = '{"total":2,"offset":0,"limit":2,"data":[{":path":"/content/alytv-eds-site/spreadsheet/jcr:content/row","Key":"name","Value":"Tester"},{":path":"/content/alytv-eds-site/spreadsheet/jcr:content/row_624324846","Key":"surname","Value":"Tester"}],":type":"sheet"}';
  // const json = JSON.parse(jsonString);
  console.log('=====JSON=====>', json);

  const table = document.createElement('table');
  table.classList.add('spreadsheet-table');

  const headers = json.data && json.data.length > 0
    ? Object.keys(json.data[0]).filter((key) => !key.startsWith(':'))
    : [];

  if (headers.length === 0) {
    console.warn('No valid data to display in the table');
    return table;
  }

  await createTableHeader(table, json.data);
  json.data.forEach((row) => {
    createTableRow(table, row, headers);
  });

  return table;
}

export default async function decorate(block) {
  const jsonLink = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('table-block');

  if (jsonLink) {
    parentDiv.append(await createTable(jsonLink.href, null));
    block.replaceWith(parentDiv);
  }
}
