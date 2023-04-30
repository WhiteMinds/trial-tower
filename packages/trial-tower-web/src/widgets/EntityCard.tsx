import { FC } from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import { Entity } from 'trial-tower-engine'

export const EntityCard: FC<{ entity: Entity.Snapshot }> = props => {
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

        {props.entity.buffs.length > 0 && (
          <>
            <Typography sx={{ fontSize: 14, marginTop: 1 }} color="textSecondary" gutterBottom>
              Buffs:
            </Typography>
            {props.entity.buffs.map((buff, idx) => (
              <Typography key={idx} variant="body2" component="p">
                {buff.name} (x{buff.stacked}): {buff.description}
              </Typography>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}
