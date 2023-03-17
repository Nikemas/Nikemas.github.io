import React, { useState, useEffect, useRef } from 'react'
import { Column } from '../Column/Column'
import './BoardContent.scss'
import { initData } from '../../actions/initData'
import _  from 'lodash'
import { mapOrder } from '../../utilites/sort'
import { Container, Draggable } from "react-smooth-dnd";
import { applyDrag } from '../../utilites/dragDrop'
import { v4 as uuidv4 } from 'uuid';

export const BoardContent = () => {
    const [board, setBoard] = useState({});
    const [columns, setColumns] = useState([])

    const [isShowAddList, setIsShowAddList] = useState(false)
    const inputRef = useRef(null)
    const [valueInput, setValueInput] = useState("")

    useEffect(() => {
      if (isShowAddList === true && inputRef && inputRef.current){
        inputRef.current.focus();
      }
    }, [isShowAddList])

    useEffect(() => {
        const boardInitData = initData.board.find(item => item.id === 'board-1')
        if(boardInitData){
            setBoard(boardInitData)

            //сортировка 
            setColumns(mapOrder(boardInitData.columns, boardInitData.collumnOrder, 'id'))
        }
    }, []);

    const onColumnDrop = (dropResult) => {
        let newColums = [...columns];
        newColums = applyDrag(newColums, dropResult);

        let newBoard = {...board};
        newBoard.columnOrder = newColums.map(column => column.id);
        newBoard.columns = newColums;

        setColumns(newColums);
        setBoard(newBoard);
    }

    const onCardDrop = (dropResult, columnId) => {
      if(dropResult.removedIndex !== null || dropResult.addedIndex !== null){
        console.log(">>> inside onCardDrop: ", dropResult, "with columnId", columnId);
        
        let newColums = [...columns];

        let currentColumn = newColums.find(column => column.id === columnId);
        currentColumn.cards = applyDrag(currentColumn.cards, dropResult);
        currentColumn.cardOrder = currentColumn.cards.map(card => card.id);

        setColumns(newColums)
      }
    }

    if(_.isEmpty(board)){
        return(
            <>
            <div className='not-found'>Board not found</div>
            </>
        )
    }

    const handleAddList = () => {
      if(!valueInput){
        if(inputRef && inputRef.current)
        inputRef.current.focus();
        return;
      }
        const _colums = _.cloneDeep(columns);
        _colums.push({
          id: uuidv4(),
          boardId: board.id,
          title: valueInput,
          cards: []
        })
        setColumns(_colums)
        setValueInput("")
        inputRef.current.focus();
    }

    const onUpdateColumn = (newColumn) => {
        const columnIdUpdate = newColumn.id;
        let ncols = [...columns] //орг
        let index = ncols.findIndex(item => item.id === columnIdUpdate)
        if(newColumn._destroy){
          //Удаление колон
            ncols.splice(index, 1);
        }else{
          // обновление названия
            ncols[index] = newColumn
        }
        setColumns(ncols)
    }

  return (
    <>
    <div className="board__columns">
    <Container
          orientation="horizontal"
          onDrop={onColumnDrop}
          getChildPayload={index => columns[index]}
          dragHandleSelector=".column-drag-handle"
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'column-drop-preview'
          }}
        >
        {columns && columns.length > 0 && columns.map((column, index) => {
            return(
                <Draggable key={column.id}>
                <Column
                    column={column}
                    onCardDrop={onCardDrop}
                    onUpdateColumn={onUpdateColumn}
                />
                </Draggable>
            )
        })}

        </Container>
        
        {isShowAddList === false ?
        <div className="add-new-column" onClick={() => setIsShowAddList (true)}>
          <i className='fa fa-plus icon'></i>  Add new column
        </div>
        :
        <div className="content-add-column">
          <input 
          type="text" 
          className='form-control'
          ref={inputRef} 
          value={valueInput}
          onChange={(event) => setValueInput(event.target.value)}
          />
          <div className='group-btn'>
              <button className='btn btn-success'
               onClick={ () => handleAddList()}
               >Add list</button>
              <i className='fa fa-times icon' onClick={() => setIsShowAddList (false)}>
              </i>
          </div>
        </div>
}
  
      </div>
    </>
  )
}
