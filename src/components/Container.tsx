import React from 'react';
import { lorem } from 'faker';
import Card from './Card';
import update from 'immutability-helper';
import Pagination from '@material-ui/lab/Pagination';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';

const style: React.CSSProperties = {
  maxWidth: 800,
  margin: '0 auto',
};

const stylePagination = {
  root: {
    '& > ul': {
      justifyContent: 'center',
    },
  },
  margin: {
    margin: 16,
  },
};

const COUNT_ITEMS = 100;
const COUNT_ITEMS_FOR_ONE_PAGE = 10;

const ITEMS: [] | null = window.localStorage.getItem('cards')
  ? JSON.parse(window.localStorage.getItem('cards') || 'null')
  : null;

export interface ContainerState {
  cardsById: { [key: string]: any };
  cardsByIndex: any[];
  page: number;
  count: number;
}

export interface ContainerProps {
  classes: any;
}

class Container extends React.Component<ContainerProps, ContainerState> {
  private pendingUpdateFn: any;
  private requestedFrame: number | undefined;

  public constructor(props: ContainerProps) {
    super(props);
    const cardsById: Record<string, any> = {};
    const cardsByIndex = [];

    if (!ITEMS) {
      for (let i = 0; i < COUNT_ITEMS; i += 1) {
        const card = { id: i, text: lorem.lines(1) };
        cardsById[card.id] = card;
        cardsByIndex[i] = card;
      }
      localStorage.setItem('cards', JSON.stringify(cardsByIndex));
    } else {
      ITEMS.forEach((item: any, i: number) => {
        cardsById[item.id] = item;
        cardsByIndex[i] = item;
      });
    }

    this.state = {
      cardsById,
      cardsByIndex,
      page: 1,
      count: Math.ceil(cardsByIndex.length / COUNT_ITEMS_FOR_ONE_PAGE),
    };
  }

  private handleChange = (event: React.ChangeEvent<unknown>, value: number): void => {
    this.setState({ page: value });
  };

  protected createCard = (): void => {
    const data = { id: 0, text: 'Input new text' };
    const newCardsById: any = {};
    const newcardsByIndex: any = [];
    this.state.cardsByIndex.forEach((card, i) => {
      const obj = { id: ++card.id, text: card.text };
      newCardsById[card.id] = obj;
      newcardsByIndex[i] = obj;
    });
    this.setState(
      {
        cardsById: { data, ...newCardsById },
        cardsByIndex: [data, ...newcardsByIndex],
        count: Math.ceil((this.state.cardsByIndex.length + 1) / COUNT_ITEMS_FOR_ONE_PAGE),
      },
      () => {
        localStorage.setItem('cards', JSON.stringify(this.state.cardsByIndex));
      },
    );
  };

  protected editCard = (id: number, text: string): void => {
    const updateCardsById = this.state.cardsById;
    const updateCard = { id, text };
    updateCardsById[id] = updateCard;
    this.setState(
      state => ({
        cardsById: { ...updateCardsById },
        cardsByIndex: state.cardsByIndex.map(card => {
          if (card.id === id) {
            return updateCard;
          } else {
            return card;
          }
        }),
      }),
      () => {
        localStorage.setItem('cards', JSON.stringify(this.state.cardsByIndex));
      },
    );
  };

  protected deleteCard = (id: number): void => {
    const data = this.state.cardsById;
    delete data[id];
    this.setState(
      {
        cardsById: data,
        cardsByIndex: this.state.cardsByIndex.filter(card => card.id !== id),
        count: Math.ceil((this.state.cardsByIndex.length - 1) / COUNT_ITEMS_FOR_ONE_PAGE),
      },
      () => {
        localStorage.setItem('cards', JSON.stringify(this.state.cardsByIndex));
      },
    );
  };

  public componentWillUnmount(): void {
    if (this.requestedFrame !== undefined) {
      cancelAnimationFrame(this.requestedFrame);
    }
  }

  public render(): JSX.Element {
    const { cardsByIndex, page, count } = this.state;
    return (
      <>
        <div>
          <div style={style}>
            {cardsByIndex
              .filter(
                (item, index) =>
                  index >= COUNT_ITEMS_FOR_ONE_PAGE * (page - 1) &&
                  index < COUNT_ITEMS_FOR_ONE_PAGE * (page - 1) + COUNT_ITEMS_FOR_ONE_PAGE,
              )
              .map(card => (
                <Card
                  key={card.id}
                  id={card.id}
                  text={card.text}
                  moveCard={this.moveCard}
                  deleteCard={this.deleteCard}
                  editCard={this.editCard}
                />
              ))}
          </div>
          <Pagination
            count={count}
            page={page}
            className={this.props.classes.root}
            variant='outlined'
            color='secondary'
            onChange={this.handleChange}
          />
        </div>
        <Fab
          color='secondary'
          aria-label='add'
          onClick={this.createCard}
          style={{ position: 'absolute', bottom: 24, right: 24 }}>
          <AddIcon />
        </Fab>
      </>
    );
  }

  private scheduleUpdate(updateFn: any) {
    this.pendingUpdateFn = updateFn;

    if (!this.requestedFrame) {
      this.requestedFrame = requestAnimationFrame(this.drawFrame);
    }
  }

  private drawFrame = (): void => {
    const nextState = update(this.state, this.pendingUpdateFn);
    this.setState(nextState);
    localStorage.setItem('cards', JSON.stringify(nextState.cardsByIndex));

    this.pendingUpdateFn = undefined;
    this.requestedFrame = undefined;
  };

  private moveCard = (id: string, afterId: string): void => {
    const { cardsById, cardsByIndex } = this.state;
    const card = cardsById[id];
    const afterCard = cardsById[afterId];
    const cardIndex = cardsByIndex.indexOf(card);
    const afterIndex = cardsByIndex.indexOf(afterCard);

    this.scheduleUpdate({
      cardsByIndex: {
        $splice: [
          [cardIndex, 1],
          [afterIndex, 0, card],
        ],
      },
    });
  };
}

export default withStyles(stylePagination)(Container);
