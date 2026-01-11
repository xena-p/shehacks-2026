from typing import Any


#Error class for pq
class EmptyPQError (Exception):
    """"""
    def __str__(self)-> str:
        return 'Empty Priority Queue, you may NOT dequeue'

class PriorityQueue:
    #_items has a int value that indicates priority in stack, and the item linked to it
    _items: list[tuple[int, Any]]
    
    def __init__(self) -> None:
        """init of the pq"""
        self._items=[]

    def is_empty(self)-> bool:
        """check if the pq is empty"""
        return self._items==[]
    
    def enqueue (self,priority:int, item:any) -> None:
        """add itm with it it's priority to queue"""
        i=0
        while i<len(self._items) and self._items[i][0]<priority:
            i+=1
        self._items.insert(i,(priority, item))

    def dequeue(self) -> Any:
        """remove itm of highest priority """
        if self.is_empty():
            raise EmptyPQError
        else:
            _priority, itm=self._items.pop()
            return itm
        
    def peek (self):
         if self.is_empty:
            raise EmptyPQError
         self._items[-1][1]