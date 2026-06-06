"use client";

import { Star } from "lucide-react";
import React from "react";

type RatingProps = {
  rating: number;
};

const Rating = ({ rating }: RatingProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={12}
          fill={index <= rating ? "#FFC107" : "none"}
          color={index <= rating ? "#FFC107" : "#D1D5DB"}
        />
      ))}
    </div>
  );
};

export default Rating;
