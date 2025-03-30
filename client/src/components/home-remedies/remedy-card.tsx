import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HomeRemedy } from '@shared/schema';

interface RemedyCardProps {
  remedy: HomeRemedy;
}

export function RemedyCard({ remedy }: RemedyCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-4 flex-1">
        <div className="mb-2">
          <div className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mb-2">
            {remedy.ailment}
          </div>
          <h3 className="text-lg font-semibold">{remedy.title}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {remedy.description}
        </p>
        
        <div className="flex items-center mt-4 mb-1">
          <div className="text-xs text-muted-foreground mr-auto">Effectiveness</div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`ri-star-fill text-sm ${
                  star <= (remedy.rating || 0) ? 'text-amber-500' : 'text-muted'
                }`}
              ></i>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {remedy.reviewCount} reviews
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{remedy.title}</DialogTitle>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">For</h4>
                <div className="text-base">{remedy.ailment}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-base">{remedy.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Ingredients</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {remedy.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-base">{ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Instructions</h4>
                <p className="text-base whitespace-pre-line">{remedy.instructions}</p>
              </div>
              
              <div className="flex items-center">
                <h4 className="text-sm font-medium text-muted-foreground mr-2">Effectiveness</h4>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`ri-star-fill text-lg ${
                        star <= (remedy.rating || 0) ? 'text-amber-500' : 'text-muted'
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({remedy.reviewCount} reviews)
                </span>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button>Save to Favorites</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
