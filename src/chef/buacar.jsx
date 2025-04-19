import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

function GridBasicExample() {
  return (
    <Form>
      <Row>
        <Col>
          <Form.Control placeholder="First name" type='text' />
        </Col>
        <Col>
          <Form.Control  type='date' />
        </Col>        
        <Col>
          <Form.Control  type='date' />
        </Col>
      </Row>
    </Form>
  );
}

export default GridBasicExample;