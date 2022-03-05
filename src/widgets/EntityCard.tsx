import { FC } from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import { Entity } from '../engine/model/entity'

export const EntityCard: FC<{ entity: Entity.Snapshot }> = (props) => {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="textSecondary" gutterBottom>
          生物
          {/* {isPlayer(props.entity) ? '玩家' : '怪物'} */}
        </Typography>
        <Typography variant="h5" component="h2">
          {props.entity.name}
        </Typography>
        <Typography sx={{ marginBottom: '12px' }} color="textSecondary">
          HP: {props.entity.currentHP} / {props.entity.maxHP}
        </Typography>
        <Typography variant="body2" component="p">
          Attack: {props.entity.atk}
        </Typography>
      </CardContent>
    </Card>
  )
}
