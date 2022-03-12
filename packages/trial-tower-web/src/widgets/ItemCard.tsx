import { FC } from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import { Item } from 'hedra-engine'

export const ItemCard: FC<{ item: Item.Snapshot }> = (props) => {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="textSecondary" gutterBottom>
          道具
          {/* {props.item.type === ItemType.Equip
            ? '装备'
            : props.item.type === ItemType.Material
            ? '材料'
            : props.item.type === ItemType.Useable
            ? '道具'
            : null} */}
        </Typography>
        <Typography variant="h5" component="h2">
          {props.item.name}
        </Typography>
        <Typography sx={{ marginBottom: '12px' }} color="textSecondary">
          数量: {props.item.stacked}
        </Typography>
        <Typography variant="body2" component="div">
          <pre>{props.item.description}</pre>
        </Typography>
      </CardContent>
    </Card>
  )
}
