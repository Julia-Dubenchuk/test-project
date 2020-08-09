import React, { memo, useState, useEffect } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { ConnectDragSource, ConnectDropTarget, DropTargetMonitor } from 'react-dnd';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ItemTypes } from './ItemTypes';

const style: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move',
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
      minWidth: 80,
    },
    input: {
      width: '100%',
    },
  }),
);

export interface CardProps {
  id: any;
  text: string;
  moveCard: (draggedId: string, id: string) => void;
  isDragging: boolean;
  connectDragSource: ConnectDragSource;
  connectDropTarget: ConnectDropTarget;
  deleteCard: (id: number) => void;
  editCard: (id: number, text: string) => void;
}

const Card: React.FC<CardProps> = memo(
  ({ id, text, isDragging, connectDragSource, connectDropTarget, deleteCard, editCard }) => {
    const classes = useStyles();
    const opacity = isDragging ? 0 : 1;
    const [isEditCard, setEditCard] = useState(false);
    const [valueText, setValueText] = useState(text);
    const showFormForEdit = (): void => {
      setEditCard(true);
    };
    const closeFormForEdit = (): void => {
      editCard(id, valueText);
      setEditCard(false);
    };
    const changeValueText = (event: React.ChangeEvent<HTMLInputElement>): void => {
      setValueText(event.target.value);
    };
    const deleteCurrentCard = () => {
      deleteCard(id);
    };
    useEffect(() => {
      setValueText(text);
    }, [text]);
    return connectDragSource(
      connectDropTarget(
        <div style={{ ...style, opacity }} onDoubleClick={showFormForEdit}>
          {isEditCard ? (
            <>
              <TextField id='standard-basic' className={classes.input} value={valueText} onChange={changeValueText} />
              <Button
                onClick={closeFormForEdit}
                variant='contained'
                color='primary'
                size='small'
                className={classes.button}
                startIcon={<SaveIcon />}>
                Save
              </Button>
            </>
          ) : (
            <span>{text}</span>
          )}
          <Button
            onClick={deleteCurrentCard}
            variant='contained'
            color='secondary'
            className={classes.button}
            startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </div>,
      ),
    );
  },
);
Card.displayName = 'Card';

export default DropTarget(
  ItemTypes.CARD,
  {
    hover(props: CardProps, monitor: DropTargetMonitor) {
      const draggedId = monitor.getItem().id;
      if (draggedId !== props.id) {
        props.moveCard(draggedId, props.id);
      }
    },
  },
  connect => ({
    connectDropTarget: connect.dropTarget(),
  }),
)(
  DragSource(
    ItemTypes.CARD,
    {
      beginDrag: (props: CardProps) => ({ id: props.id }),
    },
    (connect, monitor) => ({
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
    }),
  )(Card),
);
