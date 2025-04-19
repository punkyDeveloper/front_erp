import Table from 'react-bootstrap/Table';
function ResponsiveExample() {
    return (
      <Table responsive striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
              <th >Name</th>              
              <th>Time</th>
          </tr>
          
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            {Array.from({ length: 2 }).map((_, index) => (
              <td key={index}>Table cell {index}</td>
            ))}
            
  
          </tr>
          <tr>
            <td>2</td>
            {Array.from({ length: 2 }).map((_, index) => (
              <td key={index}>Table cell {index}</td>
            ))}
            
  
  
          </tr>
          <tr>
            <td>3</td>
            {Array.from({ length: 2 }).map((_, index) => (
              <td key={index}>Table cell {index}</td>
            ))}
            
  
  
          </tr>
        </tbody>
      </Table>
    );
  }
  
  export default ResponsiveExample;