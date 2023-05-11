import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Form, Button, Table, Modal }  from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import conn from './config/connection';
import base_url from './config/base_url';

const Home = (props) => {
    const [userInput, setUserInput] = useState({
        id       : '',
        kode     : '',
        tgl_jadi : '',
        stok     : '',
    });
    const [sendState, setSendState] = useState('/add');
    const [data, setData]           = useState([]);
    const [show, setShow]           = useState(false);
    const [search, setSearch]       = useState((new URLSearchParams(document.location.search)).get('kode'));
    
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const getData = (kode) => {
        let endpoint = '/';
        if(kode){
            endpoint = `/?kode=${kode}`;
        }
        conn.get(endpoint).then(({data}) => {
            setData(data.data);
        }).catch((e) => {
            if(e.response && e.response.data.msg){
                toast.error(e.response.data.msg);
            }
            else{
                toast.error('Terjadi kesalahan dalam memuat data, harap hubungi admin.');
            }
            console.log('ini error', e);
        })
    }

    useEffect(() => {
        getData(search);
    },[search])

    useEffect(() => {
        getData(search);
    },[]);

    const sendData = () => {
        conn.post(sendState,{
            id       : userInput.id,
            kode     : userInput.kode,
            tgl_jadi : userInput.tgl_jadi,
            stok     : userInput.stok
        }).then(({data}) => {
            if(data.status){
                getData('');
                toast.success(data.msg);
            }
            else{
                toast.error(data.msg);
            }
        }).catch((e) => {
            if(e.response && e.response.data.msg){                
                toast.error(e.response.data.msg);
            }
            else{
                toast.error('Terjadi kesalahan pada sistem, harap hubungi admin.');
            }
            console.log('ini error', e);
        });
    }

    const setInput = (key, value) => {
        setUserInput({...userInput,[key]: value });
    }

    const cancelUpdate = () => {
        setSendState('/add');
        setUserInput((prevState) => {
            return {...prevState,
                id       : '',
                kode     : '',
                tgl_jadi : '',
                stok     : '',
            }
        });
    }

    const deleteData = (id) => {
        conn.post('/delete',{
            id : id,
        }).then(({data}) => {
            if(data.status){
                getData('');
                toast.success(data.msg);
            }
            else{
                toast.error(data.msg);
            }
        }).catch((e) => {
            if(e.response.data.msg){                
                toast.error(e.response.data.msg);
            }
            else{
                toast.error('Terjadi kesalahan pada sistem, harap hubungi admin.');
            }
            console.log('ini error', e);
        })
    }

    const changeItem = (id, key) => {
        setSendState('/edit');
                
        let date = new Date(data[key].tgl_jadi);
        let fixedDate = '';
        if(isNaN(date)){
            fixedDate = data[key].tgl_jadi;
        }
        else{
            let month = (date.getMonth() + 1).toString().length <= 1 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
            fixedDate = date.getFullYear() + '-' + month + '-' + date.getDate();
        }
        setUserInput((prevState) => {
            return {...prevState,
                id: data[key].id,
                kode: data[key].kode,
                tgl_jadi: fixedDate,
                stok: data[key].stok,
            }
        });
    }

    const convertDate = (value) => {
        let date = new Date(value);
        if(isNaN(date)){
            return value;
        }
        else{
            let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
            let fixedDate = date.getDate() + ' ' + month[date.getMonth()] + ', ' + date.getFullYear();
            return fixedDate;
        }
    }
    
    const showQR = (kode) => {
        setInput('kode', kode);
        setShow(true);
    }

    return (
        <>
            <div className='col-md-9 col bg-light p-4 mx-auto'>
                <h4>Tenda STSJ Area Surabaya</h4>
                <div className='mb-2'>
                    <label htmlFor='input_kode'>Kode</label>
                    <Form.Control type='text' value={userInput.kode} onChange={(e) => setInput('kode', e.target.value)} id='input_kode' placeholder='Input Kode'/>
                </div>
                <div className='mb-2'>
                    <label htmlFor='input_tgl'>Tanggal Jadi</label>
                    <Form.Control type='date' value={userInput.tgl_jadi} onChange={(e) => setInput('tgl_jadi', e.target.value)}  id='input_tgl'/>
                </div>
                <div className='mb-2'>
                    <label htmlFor='input_stok'>Stok</label>
                    <Form.Control type='number' value={userInput.stok} onChange={(e) => setInput('stok', e.target.value)}  id='input_stok' placeholder='Input Stok'/>
                </div>
                <div className='text-end'>
                    {sendState === '/edit' ? 
                    <Button onClick={cancelUpdate} className='me-2 btn-danger'>Cancel</Button>
                    : null
                    }
                    <Button onClick={sendData}>{sendState === '/add' ? 'Tambah' : 'Update'}</Button>
                </div>
                <div className='mb-2'>
                    <label htmlFor='cari_data'>Cari Data</label>
                    <Form.Control type='text' value={search} onChange={(e) => setSearch(e.target.value)} id='cari_data' placeholder='Pencarian'/>
                </div>
                {data.length <= 0 ? 
                    <h3>Data tidak ditemukan.</h3>
                :
                    <Table>
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Tanggal Jadi</th>
                                <th>Stok</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((dat, key) => {
                                return(
                                    <tr key = {key}>
                                        <td>{dat.kode}</td>
                                        <td>{convertDate(dat.tgl_jadi)}</td>
                                        <td>{dat.stok}</td>
                                        <td>
                                            <Button onClick={() => showQR(dat.kode)} className='btn-info me-2 text-white'>Show QR</Button>
                                            <Button onClick={() => changeItem(dat.id, key)} className='btn-primary me-2'>Update</Button>
                                            <Button onClick={() => deleteData(dat.id)} className='btn-danger'>Delete</Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                }
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>
                    <p className='m-0'>QR Code {userInput.kode}</p>
                    <small className='m-0' style={{fontSize:16}}>Screenshot untuk menyimpan QR Code</small>
                </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 400, width: "100%" }}>
                        <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={base_url.baseUrl_FE + '?kode=' + userInput.kode}
                            viewBox={`0 0 256 256`}
                        />
                    </div>                    
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                {/* <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button> */}
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    )
}

export default Home;