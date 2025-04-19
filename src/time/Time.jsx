import Nav from '../assets/nav/nav';
import Table from './table';
import Buscar from './buacar';

function Time() {
    return(
        <>
        <div style={{ display: 'flex', height: '100vh' }}>

        <Nav />

        <div style={{ overflowY: 'auto',  width: '100%' }}>
        <div className='m-3'>
        <div>

            <h1>Time</h1>
        </div>
        <div>
            <div className='p-2'>
                
            <Buscar />
            </div>
            <div className='p-2'>

            <Table />
            </div>
        </div>
        </div>
        </div>
        </div>
        </>

    )
}
export default Time ;