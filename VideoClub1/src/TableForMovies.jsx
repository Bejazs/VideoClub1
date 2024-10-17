import fakeData from './MOCK_DATA.json';
import { useTable } from 'react-table';
import React, { useState, useEffect } from 'react';
import './ReactTable.css'; 
import "./Components/Modal/Modal.css";

function Movies() {
    //FOR TABLE
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    
    //FOR MODAL
    const [modal, setModal] = useState(false);
    const [textSelected, setTextSelected] = useState("");
    const [movieGenre, setMovieGenre] = useState("");
    const [idSelected, setIdSelected] = useState(0);
    const [items, setItems] = useState([]);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const handleCommentChange = (event) => {
        setComment(event.target.value); // Update state with textarea value
    };

    const headers = {
        'Accept': '*/*'
    };

    // API for movies
    const fetchMovies = () => {
        setLoading(true);
        window.fetch('https://moviesdemoapi.azurewebsites.net/api/v1/Movies', {
            method: 'GET',
            headers: headers
        })
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then((data) => setMovies(data))
        .catch((error) => console.error('Fetch error:', error))
        .finally(() => setLoading(false));
    };

    // API for MOVIe DETAILS
    const fetchCastMembers = () => {
        if (idSelected === null) return; // Avoid fetch if idSelected is null
        setLoadingDetails(true);
        window.fetch(`https://moviesdemoapi.azurewebsites.net/api/v1/Movies/${idSelected}/Actors`, {
            method: 'GET',
            headers: headers
        })
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then((data) => setItems(data))
        .catch((error) => console.error('Fetch error:', error))
        .finally(() => setLoadingDetails(false));
    };

    const fetchComments = () => {
        if (idSelected === null) return; // Avoid fetch if idSelected is null
        setLoadingComments(true);
        window.fetch(`https://moviesdemoapi.azurewebsites.net/api/v1/Comments/Movie/${idSelected}`, {
            method: 'GET',
            headers: headers
        })
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then((data) => setComments(data))
        .catch((error) => console.error('Fetch error:', error))
        .finally(() => setLoadingComments(false));
    };

    const postComment = async() => {
        const response = await window.fetch(`https://moviesdemoapi.azurewebsites.net/api/v1/Comments/Movie/${idSelected}`, {
          method: 'POST',
          body: JSON.stringify({
              Author: "Anonymous",
              Content: comment
          }),
        //    headers: {
        //       'Content-type': 'application/json; charset=UTF-8',
        //   },
        })
        .catch((error) => console.error('Fetch error:', error));
      };

    useEffect(() => {
        fetchMovies();
    }, []);

    useEffect(() => {
        if (modal && idSelected !== null) {
            fetchCastMembers();
            fetchComments();
        }
    }, [modal, idSelected]); // Fetch cast members when modal opens and idSelected changes


    //HANDLERS
    const handleShow = (cell) => {
        setTextSelected(cell?.row?.original.Title);
        setIdSelected(cell?.row?.original.Id);
        setMovieGenre(cell?.row?.original.Genre.GenreName);
        console.log("Filme selecionado: "+idSelected);
        setModal(true); // Open modal
    };

    const handleSubmit = () => {
        // Handle the comment submission logic here
        console.log("Submitted Comment:", comment);
        postComment();
        fetchComments();
        setComment(""); // Clear the textarea after submission
    };

    const columns = React.useMemo(() => [
        {
            Header: "ID",
            accessor: "Id",
        },
        {
            Header: "Movie",
            accessor: "Title",
        },
        {
            Header: "Price",
            accessor: "Price",
        },
        {
            Header: " ",
            Cell: props => <button className="btn1" onClick={() => handleShow(props)}>Edit</button>
        },
    ], []);

    const data = React.useMemo(() => movies, [movies]);
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({
        columns,
        data,
    });

    return (
      <>
        {modal && (
            <div className="modal">
                <div onClick={() => setModal(false)} className="overlay"></div>
                <div className="modal-content">
                    <h2 style={{"margin-bottom": "0px"}}>{textSelected}</h2>
                    <h4 style={ {"margin-top":"0px", "margin-left": "5px"}}>{movieGenre}</h4>
                    <div>
                        <div>
                            <h3 style={{"margin-bottom": "0px"}}>Actors</h3>
                            {loadingDetails ? (<div>Loading Actors...</div>) : (
                                <ul style={{"margin-top": "5px"}}>
                                    {items.map((item, index) => (
                                        <li key={index}>{item.Name} {item.Surname}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div>
                        <textarea name="Comments" rows="4" cols="50" placeholder="Write a comment!" value={comment} onChange={handleCommentChange} ></textarea>
                        <h4 style={ {"margin-top":"0px", "margin-left": "5px","margin-bottom":"0px"}}>Comments</h4>
                        {loadingComments ? (<div>Loading Comments...</div>) : (
                                <ul style={{"margin-top": "5px"}}>
                                    {comments.map((item, index) => (
                                        <li key={index}>{item.Content}</li>
                                    ))}
                                </ul>
                        )}
                    </div>
                    <div className='buttonAlignment'> 
                        <button className="btn1" onClick={handleSubmit}>Submit</button>
                    </div>
                   
                    <button className="close-modal" onClick={() => setModal(false)}>Close</button>
                </div>
            </div>
        )}
        {loading ? 
            (<div>Loading...</div>) :
            (
                <div>
                    <table className='ReactTable' {...getTableProps()}>
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map((column) => (
                                        <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map((row) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map((cell) => (
                                            <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
      </>
    );
}

export default Movies;
