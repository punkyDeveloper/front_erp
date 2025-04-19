import Table from 'react-bootstrap/Table';
import { FaFileDownload } from 'react-icons/fa'; // Importa el ícono de FontAwesome

function ResponsiveExample() {
  return (
    <Table responsive striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>#</th>
          <th>Restaurante</th>
          <th>Time</th>
          <th>Date</th>
          <th>Registrado Por</th>
          <th>Opción</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>dd</td>
          <td>d</td>
          <td>c</td>
          <td>c</td>
          <td>
            <FaFileDownload style={{ cursor: 'pointer', color: 'white' }} title="Descargar" />
          </td>
        </tr>
        <tr>
          <td>2</td>
          <td>dd</td>
          <td>d</td>
          <td>c</td>
          <td>c</td>
          <td>
            <FaFileDownload style={{ cursor: 'pointer', color: 'white' }} title="Descargar" />
          </td>
        </tr>
        <tr>
          <td>3</td>
          <td>dd</td>
          <td>d</td>
          <td>c</td>
          <td>c</td>
          <td>
            <FaFileDownload style={{ cursor: 'pointer', color: 'white' }} title="Descargar" />
          </td>
        </tr>
      </tbody>
    </Table>
  );
}

export default ResponsiveExample;
