import { FC } from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import { Entity, Skill } from 'hedra-engine'

export const SkillCard: FC<{ skill: Skill.Snapshot }> = props => {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" component="h3">
          [LV.{props.skill.level}] {props.skill.name}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="textSecondary" gutterBottom>
          效果：
        </Typography>
        <Typography variant="body2" component="div">
          <pre style={{ margin: 0 }}>{props.skill.description}</pre>
        </Typography>
      </CardContent>
    </Card>
  )
}
